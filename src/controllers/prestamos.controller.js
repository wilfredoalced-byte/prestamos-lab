const { sequelize, Equipo, Prestamo } = require('../models');
const { leerId, esFechaValida, hoy, textoValido } = require('../utils/validaciones');

// Datos que se muestran junto a cada préstamo
const INCLUIR = [
  { association: 'equipo', attributes: ['id', 'codigo', 'nombre'] },
  { association: 'registradoPor', attributes: ['id', 'nombre', 'correo'] },
];

// GET /api/prestamos?activos=true&equipo_id=1
async function listar(req, res) {
  const filtro = {};
  const { activos, equipo_id } = req.query;

  // Filtro 1: solo préstamos activos (sin fecha de devolución)
  if (activos !== undefined) {
    if (activos === 'true') filtro.fecha_devolucion = null;
    else if (activos !== 'false') {
      return res.status(400).json({ error: 'El filtro "activos" debe ser true o false' });
    }
  }

  // Filtro 2: historial de un equipo
  if (equipo_id !== undefined) {
    const id = leerId(equipo_id);
    if (!id) return res.status(400).json({ error: 'El filtro "equipo_id" debe ser un número entero positivo' });
    const equipo = await Equipo.findByPk(id);
    if (!equipo) return res.status(404).json({ error: `No existe el equipo con id ${id}` });
    filtro.equipo_id = id;
  }

  const prestamos = await Prestamo.findAll({ where: filtro, include: INCLUIR, order: [['id', 'DESC']] });
  res.json(prestamos);
}

// POST /api/prestamos
async function crear(req, res) {
  const { equipo_id, prestatario, fecha_prestamo, fecha_prevista } = req.body || {};

  // 1. Validar datos → 400
  const idEquipo = leerId(equipo_id);
  if (!idEquipo) return res.status(400).json({ error: 'El campo "equipo_id" es obligatorio y debe ser un número entero' });
  if (!textoValido(prestatario, 2)) return res.status(400).json({ error: 'El campo "prestatario" es obligatorio' });

  const fechaPrestamo = fecha_prestamo === undefined ? hoy() : fecha_prestamo;
  if (!esFechaValida(fechaPrestamo)) {
    return res.status(400).json({ error: 'El campo "fecha_prestamo" debe tener formato AAAA-MM-DD' });
  }
  if (!esFechaValida(fecha_prevista)) {
    return res.status(400).json({ error: 'El campo "fecha_prevista" es obligatorio con formato AAAA-MM-DD' });
  }
  if (fecha_prevista < fechaPrestamo) {
    return res.status(400).json({ error: 'La "fecha_prevista" no puede ser anterior a la "fecha_prestamo"' });
  }

  // 2. Transacción: todo se hace junto o no se hace nada
  const resultado = await sequelize.transaction(async (t) => {
    // Bloquea la fila del equipo para que dos peticiones al mismo tiempo no lo presten dos veces
    const equipo = await Equipo.findByPk(idEquipo, { transaction: t, lock: t.LOCK.UPDATE });
    if (!equipo) return { estado: 404, cuerpo: { error: `No existe el equipo con id ${idEquipo}` } };

    // 3. REGLA CLAVE: ¿el equipo ya tiene un préstamo activo?
    const activo = await Prestamo.findOne({
      where: { equipo_id: idEquipo, fecha_devolucion: null },
      transaction: t,
    });
    if (activo) {
      return {
        estado: 409,
        cuerpo: { error: `El equipo ${equipo.codigo} ya está prestado (préstamo activo id ${activo.id})` },
      };
    }

    // 4. Registrar el préstamo. El responsable es el usuario del token.
    const prestamo = await Prestamo.create({
      equipo_id: idEquipo,
      usuario_id: req.usuario.id,
      prestatario: prestatario.trim(),
      fecha_prestamo: fechaPrestamo,
      fecha_prevista,
    }, { transaction: t });

    return { estado: 201, cuerpo: { mensaje: 'Préstamo registrado correctamente', prestamo } };
  });

  res.status(resultado.estado).json(resultado.cuerpo);
}

// PUT /api/prestamos/:id/devolucion
async function devolver(req, res) {
  const id = leerId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un número entero positivo' });

  const prestamo = await Prestamo.findByPk(id);
  if (!prestamo) return res.status(404).json({ error: `No existe el préstamo con id ${id}` });

  if (prestamo.fecha_devolucion) {
    return res.status(409).json({ error: `Este préstamo ya fue devuelto el ${prestamo.fecha_devolucion}` });
  }

  const { fecha_devolucion } = req.body || {};
  const fecha = fecha_devolucion === undefined ? hoy() : fecha_devolucion;
  if (!esFechaValida(fecha)) {
    return res.status(400).json({ error: 'El campo "fecha_devolucion" debe tener formato AAAA-MM-DD' });
  }
  if (fecha < prestamo.fecha_prestamo) {
    return res.status(400).json({ error: 'La "fecha_devolucion" no puede ser anterior a la "fecha_prestamo"' });
  }

  // Al llenar la fecha, el préstamo deja de estar activo y el equipo queda disponible
  await prestamo.update({ fecha_devolucion: fecha });
  res.json({ mensaje: 'Devolución registrada. El equipo vuelve a estar disponible', prestamo });
}

module.exports = { listar, crear, devolver };
