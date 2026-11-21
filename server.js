import express from 'express';
import { pool } from './db.js';
import { peliculaSchema, validate } from './validate.js';

const app = express();
app.use(express.json()); // siempre después de crear app

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
