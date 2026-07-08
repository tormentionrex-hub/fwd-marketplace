-- Catálogo base de habilidades del sistema (idempotente).
-- Aplicar en Supabase:  npx prisma db execute --file prisma/sql/seed_habilidades.sql --schema prisma/schema.prisma
INSERT INTO public.habilidades (nombre, categoria)
SELECT v.nombre, v.categoria
FROM (VALUES
  ('JavaScript', 'Lenguajes'),
  ('TypeScript', 'Lenguajes'),
  ('Python', 'Lenguajes'),
  ('Java', 'Lenguajes'),
  ('C#', 'Lenguajes'),
  ('PHP', 'Lenguajes'),
  ('HTML/CSS', 'Frontend'),
  ('React', 'Frontend'),
  ('Next.js', 'Frontend'),
  ('Vue.js', 'Frontend'),
  ('Angular', 'Frontend'),
  ('Tailwind CSS', 'Frontend'),
  ('Node.js', 'Backend'),
  ('Express', 'Backend'),
  ('NestJS', 'Backend'),
  ('Django', 'Backend'),
  ('Spring Boot', 'Backend'),
  ('Laravel', 'Backend'),
  ('GraphQL', 'Backend'),
  ('PostgreSQL', 'Bases de datos'),
  ('MySQL', 'Bases de datos'),
  ('MongoDB', 'Bases de datos'),
  ('Supabase', 'Bases de datos'),
  ('Prisma', 'Bases de datos'),
  ('Docker', 'DevOps'),
  ('AWS', 'DevOps'),
  ('Git', 'DevOps'),
  ('CI/CD', 'DevOps'),
  ('React Native', 'Mobile'),
  ('Figma', 'Diseño')
) AS v(nombre, categoria)
WHERE NOT EXISTS (
  SELECT 1 FROM public.habilidades h WHERE h.nombre = v.nombre
);
