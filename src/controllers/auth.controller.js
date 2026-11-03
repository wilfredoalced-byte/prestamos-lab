const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/registro
async function registro(req, res) {
  const { nombre, correo, password } = req.body || {};

  // Validar los datos de entrada → 400
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    return res.status(400).json({ error: 'El campo "nombre" es obligatorio (mínimo 2 caracteres)' });
  }
  if (!correo || !CORREO_VALIDO.test(correo)) {
    return res.status(400).json({ error: 'El campo "correo" es obligatorio y debe tener formato válido' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'El campo "password" es obligatorio (mínimo 6 caracteres)' });
  }

  // Correo repetido → 409
  const existe = await Usuario.findOne({ where: { correo: correo.toLowerCase() } });
  if (existe) {
    return res.status(409).json({ error: 'El correo ya está registrado' });
  }

  // Guardar la contraseña como HASH (nunca en texto plano)
  const password_hash = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({
    nombre: nombre.trim(),
    correo: correo.toLowerCase(),

    password_hash,
  });

  // 201 = creado. No se devuelve el hash.
  res.status(201).json({
    mensaje: 'Usuario registrado correctamente',
    usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo },
  });
}

// POST /api/auth/login
async function login(req, res) {
  const { correo, password } = req.body || {};

  if (!correo || !password) {
    return res.status(400).json({ error: 'Los campos "correo" y "password" son obligatorios' });
  }

  // Se busca con el hash incluido para poder compararlo
  const usuario = await Usuario.scope('conPassword').findOne({ where: { correo: String(correo).toLowerCase() } });

  // Mismo mensaje si no existe o si la contraseña es incorrecta (más seguro)
  const correcta = usuario && (await bcrypt.compare(String(password), usuario.password_hash));
  if (!correcta) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  }

  // Crear el token JWT firmado con la clave secreta
  const token = jwt.sign(
    { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }

  );

  res.json({ mensaje: 'Inicio de sesión correcto', token });
}

// GET /api/auth/perfil (ruta protegida para probar el token)
function perfil(req, res) {
  res.json({ usuario: req.usuario });
}

module.exports = { registro, login, perfil };