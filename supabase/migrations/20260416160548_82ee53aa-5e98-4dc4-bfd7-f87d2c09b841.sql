CREATE POLICY "Students can drop own enrollments"
ON public.course_enrollments
FOR DELETE
TO authenticated
USING (auth.uid() = student_id);