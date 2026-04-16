
-- Course invitations: professors invite specific students by email
CREATE TABLE public.course_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_email TEXT NOT NULL,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, student_email)
);

ALTER TABLE public.course_invitations ENABLE ROW LEVEL SECURITY;

-- Professors can manage invitations for their own courses
CREATE POLICY "Professors can view invitations for own courses"
ON public.course_invitations FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = course_invitations.course_id AND courses.professor_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'student')
);

CREATE POLICY "Professors can create invitations"
ON public.course_invitations FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = course_invitations.course_id AND courses.professor_id = auth.uid())
);

CREATE POLICY "Professors can delete invitations"
ON public.course_invitations FOR DELETE TO authenticated
USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = course_invitations.course_id AND courses.professor_id = auth.uid())
);
