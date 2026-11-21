import express from "express";
const app = express();

const peliculas = [
  { id: 1, titulo: "Avatar", genero: "Ciencia Ficcion" },
  { id: 2, titulo: "Avengers", genero: "Ciencia Ficcion" },
  { id: 3, titulo: "Luis Posada", genero: "Comedia" }
]

const artistas = [
  { idArt: 1, nombre: 'aa', generoMusical: 'clasica', pais: 'UE' },
  { idArt: 2, nombre: 'bb', generoMusical: 'rock', pais: 'EE.UU' },
  { idArt: 3, nombre: 'cc', generoMusical: 'balado', pais: 'Argentina' }
]



app.get('/', (req, res) => {
  res.send('Primer servidor Express')

});

// app.get('/peliculas', (req, res) => {
//   res.json(peliculas);
// });


//Consulta todos los datos con GET 

app.get('/peliculas', (req, res) => {
  const { genero } = req.query;
  if (genero) {
    const resultado = peliculas.filter(
      p => p.genero.toLowerCase() === genero.toLowerCase()
    );
    return res.json(resultado);
  }
  res.json(peliculas);
});

//Consulta Peliculas por ID con GET 

app.get('/peliculas/:id', (req, res) => {
  const id = Number(req.params.id);
  const pelicula = peliculas.find(p => p.id === id);

  if (!pelicula) {
    return res.status(404).json({
      mensaje: 'pelicula no encontrada'
    });
  }
  res.json(pelicula);
});

//Indaga si hay una pelicula con el nombre, lo registra, verifica si esta y valida si el nombre se real

app.post('/peliculas', (req, res) => {
  const { titulo, genero } = req.body

  if (
    typeof titulo !== 'string' ||
    typeof genero !== 'string' ||
    !titulo.trim() ||
    !genero.trim()) {
    return res.status(400).json({
      mensaje: 'Titulo o genero son obligatorios, deben ser textos validos'
    });
  }

  const existe = peliculas.some(
    p => p.titulo.toLocaleLowerCase() === titulo.trim().toLocaleLowerCase()
  );
  if (existe) {
    return res.status(409).json({
      mensaje: 'Ya existe una pelicula con ese titulo'
    })
  }

  const nuevaPelicula = {
    id: Math.max(0, ...peliculas.map(p => p.id)) + 1,
    titulo,
    genero
  };
  peliculas.push(nuevaPelicula);

  res.status(201).json({
    mensaje: 'pelicula registrada',
    pelicula: nuevaPelicula
  });
})

//Actualiza las peliculas por el ID con PUT

app.put('/peliculas/:id', (req, res) => {
  const id = Number(req.params.id);
  const { titulo, genero } = req.body;
  const pelicula = peliculas.find(p => p.id === id);
  if (!pelicula) {
    return res.status(404).json({
      mensaje: 'pelicula no encontrada'
    })
  }
  if (!titulo || !genero) {
    return res.status(400).json({
      mensaje: 'titulo y genero obligatorios'
    });
  }
  pelicula.titulo = titulo;
  pelicula.genero = genero;
  res.json({
    mensaje: 'pelicula actualizada',
    pelicula
  })

})

//Elimina peliculas por el ID con DELETE

app.delete('/peliculas/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = peliculas.findIndex(p => p.id === id);

  if (indice === -1) {
    return res.status(404).json({
      mensaje: 'pelicula no encontrada'
    });
  }
  const eliminada = peliculas.splice(indice, 1);
  res.json({
    mensaje: 'peliculas eliminada',
    pelicula: eliminada[0]
  });
});


//APARTADO ARTISTAS

app.get('/artistas', (req, res) => {
  const { nombre } = req.query;
  if (nombre) {
    const resultado = artistas.filter(
      p => p.nombre.toLowerCase() === nombre.toLowerCase()
    );
    return res.json(resultado);
  }
  res.json(artistas);
});



app.get('/artistas/:idArt', (req, res) => {
  const idArt = Number(req.params.idArt);
  const artista = artistas.find(p => p.idArt === idArt);

  if (!artista) {
    return res.status(404).json({
      mensaje: 'artista no encontrado'
    });
  }
  res.json(artista);
});


app.post('/artistas', (req, res) => {
  const { nombre, generoMusical, pais } = req.body;


  if (
    typeof nombre !== 'string' ||
    typeof generoMusical !== 'string' ||
    typeof pais !== 'string' ||
    !nombre.trim() ||
    !generoMusical.trim() ||
    !pais.trim()
  ) {
    return res.status(400).json({
      mensaje: 'Nombre, genero musical y pais son obligatorios, y deben ser textos validos'
    });
  }

  const existe = artistas.some(
    a => a.nombre.toLowerCase().trim() === nombre.toLowerCase().trim()
  );

  if (existe) {
    return res.status(409).json({
      mensaje: 'Ya existe un artista registrado con ese nombre'
    });
  }


  const nuevoArtista = {
    idArt: Math.max(0, ...artistas.map(p => p.idArt)) + 1,
    nombre: nombre.trim(),
    generoMusical: generoMusical.trim(),
    pais: pais.trim()
  };

  artistas.push(nuevoArtista);

  res.status(201).json({
    mensaje: 'artista registrado',
    artista: nuevoArtista
  });
});



app.put('/artistas/:idArt', (req, res) => {
  const idArt = Number(req.params.idArt);
  const { nombre, generoMusical, pais } = req.body;
  const artista = artistas.find(p => p.idArt === idArt);
  if (!artista) {
    return res.status(404).json({
      mensaje: 'artista no encontrado'
    })
  }
  if (!nombre || !generoMusical || !pais) {
    return res.status(400).json({
      mensaje: 'nombre, genero musical y pais son obligatorios'
    });
  }
  artista.nombre = nombre;
  artista.generoMusical = generoMusical;
  artista.pais = pais;
  res.json({
    mensaje: 'artista actualizado',
    artista
  })

})



app.delete('/artistas/:idArt', (req, res) => {
  const idArt = Number(req.params.idArt);
  const indice = artistas.findIndex(p => p.idArt === idArt);

  if (indice === -1) {
    return res.status(404).json({
      mensaje: 'artista no encontrado'
    });
  }
  const eliminada = artistas.splice(indice, 1);
  res.json({
    mensaje: 'artista eliminado',
    artista: eliminada[0]
  });
});


app.listen(3000, () => {
  console.log('Servidor ejecutandose en el puerto 3000');
});
