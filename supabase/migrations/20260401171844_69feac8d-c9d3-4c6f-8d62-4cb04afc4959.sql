
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('student', 'professor');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User roles table (for secure role checks)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Secure role check function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get current user role helper
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  professor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  schedule TEXT,
  semester TEXT NOT NULL DEFAULT 'Spring 2026',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses viewable by enrolled students and professors" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Professors can create courses" ON public.courses FOR INSERT WITH CHECK (auth.uid() = professor_id AND public.has_role(auth.uid(), 'professor'));
CREATE POLICY "Professors can update own courses" ON public.courses FOR UPDATE USING (auth.uid() = professor_id);
CREATE POLICY "Professors can delete own courses" ON public.courses FOR DELETE USING (auth.uid() = professor_id);
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Course enrollments
CREATE TABLE public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, student_id)
);
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view own enrollments" ON public.course_enrollments FOR SELECT USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'professor'));
CREATE POLICY "Professors can enroll students" ON public.course_enrollments FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'professor'));
CREATE POLICY "Professors can remove students" ON public.course_enrollments FOR DELETE USING (public.has_role(auth.uid(), 'professor'));

-- Assignments table
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  max_points INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Assignments viewable by authenticated users" ON public.assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Professors can create assignments" ON public.assignments FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'professor') AND
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND professor_id = auth.uid())
);
CREATE POLICY "Professors can update own course assignments" ON public.assignments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND professor_id = auth.uid())
);
CREATE POLICY "Professors can delete own course assignments" ON public.assignments FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND professor_id = auth.uid())
);
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Submissions table
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view own submissions" ON public.submissions FOR SELECT USING (
  auth.uid() = student_id OR public.has_role(auth.uid(), 'professor')
);
CREATE POLICY "Students can submit" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update own submissions" ON public.submissions FOR UPDATE USING (auth.uid() = student_id);
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grades table
CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  grader_id UUID REFERENCES auth.users(id) NOT NULL,
  points INTEGER NOT NULL,
  letter_grade TEXT,
  feedback TEXT,
  graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view own grades" ON public.grades FOR SELECT USING (
  auth.uid() = student_id OR public.has_role(auth.uid(), 'professor')
);
CREATE POLICY "Professors can grade" ON public.grades FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'professor'));
CREATE POLICY "Professors can update grades" ON public.grades FOR UPDATE USING (public.has_role(auth.uid(), 'professor'));

-- Attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, student_id, date)
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view own attendance" ON public.attendance FOR SELECT USING (
  auth.uid() = student_id OR public.has_role(auth.uid(), 'professor')
);
CREATE POLICY "Professors can record attendance" ON public.attendance FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'professor'));
CREATE POLICY "Professors can update attendance" ON public.attendance FOR UPDATE USING (public.has_role(auth.uid(), 'professor'));

-- Auto-create profile and role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for submissions
INSERT INTO storage.buckets (id, name, public) VALUES ('submissions', 'submissions', false);
CREATE POLICY "Users can upload submissions" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'submissions' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own submissions" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'submissions' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Professors can view all submissions" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'submissions' AND public.has_role(auth.uid(), 'professor'));
