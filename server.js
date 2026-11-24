import express from 'express';
import { pool } from './db.js';
import { peliculaSchema, validate } from './validate.js';

const app = express();
app.use(express.json()); // siempre después de crear app

//Consulta Peliculas
app.get('/peliculas', async (req, res) => {
  const { genero } = req.query;
  const [filas] =
    typeof genero === 'string'
      ? await pool.execute(
          'SELECT id, titulo, genero FROM peliculas WHERE genero = ?',
          [genero],
        )
      : await pool.execute('SELECT id, titulo, genero FROM peliculas');
  res.json(filas);
});

// Consultar película por ID
app.get('/peliculas/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      mensaje: 'ID inválido',
    });
  }

  const [filas] = await pool.execute(
    'SELECT id, titulo, genero FROM peliculas WHERE id = ?',
    [id],
  );

  if (filas.length === 0) {
    return res.status(404).json({
      mensaje: 'Película no encontrada',
    });
  }

  res.json(filas[0]);
});

// Registro Peliculas
app.post('/peliculas', validate(peliculaSchema), async (req, res) => {
  const { titulo, genero } = req.body;
  try {
    const [r] = await pool.execute(
      'INSERT INTO peliculas (titulo, genero) VALUES (?, ?)',
      [titulo, genero],
    );
    res.status(201).json({
      mensaje: 'pelicula registrada',
      pelicula: { id: r.insertId, titulo, genero },
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res
        .status(409)
        .json({ mensaje: 'Ya existe una pelicula con ese titulo' });
    }
    throw err;
  }
});

// Actualizar película
app.put('/peliculas/:id', validate(peliculaSchema), async (req, res) => {
  const id = Number(req.params.id);
  const { titulo, genero } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      mensaje: 'ID inválido',
    });
  }

  try {
    const [r] = await pool.execute(
      'UPDATE peliculas SET titulo = ?, genero = ? WHERE id = ?',
      [titulo, genero, id],
    );

    if (r.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Película no encontrada',
      });
    }

    res.json({
      mensaje: 'Película actualizada',
      pelicula: { id, titulo, genero },
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        mensaje: 'Ya existe una película con ese título',
      });
    }

    throw err;
  }
});

// Eliminar película
app.delete('/peliculas/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      mensaje: 'ID inválido',
    });
  }

  const [r] = await pool.execute('DELETE FROM peliculas WHERE id = ?', [id]);

  if (r.affectedRows === 0) {
    return res.status(404).json({
      mensaje: 'Película no encontrada',
    });
  }

  res.json({
    mensaje: 'Película eliminada',
  });
});

// ...al final, después de todas las rutas y antes de app.listen:
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed')
    return res.status(400).json({ mensaje: 'JSON invalido' });
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

app.listen(process.env.PORT || 3000, () =>
  console.log('Servidor ejecutandose'),
);
