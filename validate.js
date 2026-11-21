import { z } from 'zod';

export const peliculaSchema = z.object({
  titulo: z.string({ error: 'El título es obligatorio y debe ser texto' })
    .trim().min(1, 'El título no puede estar vacío').max(100),
  genero: z.string({ error: 'El género es obligatorio y debe ser texto' })
    .trim().min(1, 'El género no puede estar vacío').max(50),
});

export const validate = (schema) => (req, res, next) => {
  const r = schema.safeParse(req.body);
  if (!r.success) {
    return res.status(400).json({
      mensaje: 'Datos inválidos',
      errores: r.error.issues.map(i => ({ campo: i.path.join('.'), mensaje: i.message })),
    });
  }
  req.body = r.data; // ya limpio (con trim)
  next();
};
