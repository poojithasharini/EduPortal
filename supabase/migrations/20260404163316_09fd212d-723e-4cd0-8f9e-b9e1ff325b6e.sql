
-- Allow professors to delete attendance records (needed for re-recording)
CREATE POLICY "Professors can delete attendance"
ON public.attendance FOR DELETE
TO public
USING (has_role(auth.uid(), 'professor'::app_role));

-- Allow students to self-enroll in courses
CREATE POLICY "Students can self-enroll"
ON public.course_enrollments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id AND has_role(auth.uid(), 'student'::app_role));
