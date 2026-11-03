const { Equipo, Prestamo } = require('../models');
const { leerId, textoValido } = require('../utils/validaciones');

const CONDICIONES = ['nuevo', 'bueno', 'regular', 'malo'];

// Revisa los datos de un equipo. "parcial" = true cuando se actualiza (PUT)
function validarEquipo(datos, parcial) {
  const { codigo, nombre, categoria, condicion } = datos;
  if (!parcial || codigo !== undefined) {
    if (!textoValido(codigo, 2)) return 'El campo "codigo" es obligatorio (ej: LAB-005)';
  }
  if (!parcial || nombre !== undefined) {
    if (!textoValido(nombre, 2)) return 'El campo "nombre" es obligatorio';
  }
  if (!parcial || categoria !== undefined) {
    if (!textoValido(categoria, 2)) return 'El campo "categoria" es obligatorio';
  }
  if (condicion !== undefined && !CONDICIONES.includes(condicion)) {
    return `El campo "condicion" debe ser uno de: ${CONDICIONES.join(', ')}`;
  }
  return null;
}

// Agrega el campo "disponible" a un equipo (true si no tiene préstamo activo)
async function conDisponibilidad(equipo) {
  const activo = await Prestamo.findOne({ where: { equipo_id: equipo.id, fecha_devolucion: null } });
  return { ...equipo.toJSON(), disponible: !activo };
}

// GET /api/equipos
async function listar(req, res) {
  const equipos = await Equipo.findAll({ order: [['id', 'ASC']] });
  const resultado = await Promise.all(equipos.map(conDisponibilidad));
  res.json(resultado);
}

// GET /api/equipos/:id
async function obtener(req, res) {
  const id = leerId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un número entero positivo' });

  const equipo = await Equipo.findByPk(id);
  if (!equipo) return res.status(404).json({ error: `No existe el equipo con id ${id}` });

  res.json(await conDisponibilidad(equipo));
}

// POST /api/equipos
async function crear(req, res) {
  const datos = req.body || {};
  const error = validarEquipo(datos, false);
  if (error) return res.status(400).json({ error });

  const codigo = datos.codigo.trim().toUpperCase();
  const repetido = await Equipo.findOne({ where: { codigo } });
  if (repetido) return res.status(409).json({ error: `Ya existe un equipo con el código ${codigo}` });

  const equipo = await Equipo.create({
    codigo,
    nombre: datos.nombre.trim(),
    categoria: datos.categoria.trim(),
    condicion: datos.condicion || 'bueno',
  });
  res.status(201).json({ mensaje: 'Equipo creado correctamente', equipo });
}

// PUT /api/equipos/:id
async function actualizar(req, res) {
  const id = leerId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un número entero positivo' });

  const equipo = await Equipo.findByPk(id);
  if (!equipo) return res.status(404).json({ error: `No existe el equipo con id ${id}` });

  const datos = req.body || {};
  const error = validarEquipo(datos, true);
  if (error) return res.status(400).json({ error });

  const cambios = {};
  if (datos.codigo !== undefined) {
    cambios.codigo = datos.codigo.trim().toUpperCase();
    const repetido = await Equipo.findOne({ where: { codigo: cambios.codigo } });
    if (repetido && repetido.id !== id) {
      return res.status(409).json({ error: `Ya existe un equipo con el código ${cambios.codigo}` });
    }
  }
  if (datos.nombre !== undefined) cambios.nombre = datos.nombre.trim();
  if (datos.categoria !== undefined) cambios.categoria = datos.categoria.trim();
  if (datos.condicion !== undefined) cambios.condicion = datos.condicion;

  if (Object.keys(cambios).length === 0) {
    return res.status(400).json({ error: 'Envíe al menos un campo: codigo, nombre, categoria o condicion' });
  }

  await equipo.update(cambios);
  res.json({ mensaje: 'Equipo actualizado correctamente', equipo });
}

// DELETE /api/equipos/:id
async function eliminar(req, res) {
  const id = leerId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un número entero positivo' });

  const equipo = await Equipo.findByPk(id);
  if (!equipo) return res.status(404).json({ error: `No existe el equipo con id ${id}` });

  // Regla del negocio: no se elimina un equipo con historial de préstamos
  const totalPrestamos = await Prestamo.count({ where: { equipo_id: id } });
  if (totalPrestamos > 0) {
    return res.status(409).json({
      error: `No se puede eliminar: el equipo tiene ${totalPrestamos} préstamo(s) en su historial`,
    });
  }

  await equipo.destroy();
  res.json({ mensaje: 'Equipo eliminado correctamente' });
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
