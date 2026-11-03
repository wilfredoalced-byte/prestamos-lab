const jwt = require('jsonwebtoken');

// MIDDLEWARE: revisa que la petición traiga un token JWT válido
// Si no lo trae o es inválido → 401 y la petición NO continúa
function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization || '';
  const [tipo, token] = encabezado.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Falta el token. Envíe: Authorization: Bearer <token>' });
  }

  try {
    // Verifica la firma con la clave secreta del .env
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = datos; // guarda quién es el usuario para usarlo después
    next(); // todo bien → continúa a la ruta
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = verificarToken;