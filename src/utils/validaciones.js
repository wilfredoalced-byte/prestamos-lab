// Funciones de ayuda para validar los datos que llegan a la API

// Convierte el id de la URL en número. Devuelve null si no es válido.
function leerId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Revisa que el texto tenga formato AAAA-MM-DD y que sea una fecha real
function esFechaValida(texto) {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fecha = new Date(texto + 'T00:00:00Z');
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === texto;
}

// Fecha de hoy en formato AAAA-MM-DD (hora de Perú)
function hoy() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
}

// Revisa que un texto no esté vacío
function textoValido(valor, minimo = 1) {
  return typeof valor === 'string' && valor.trim().length >= minimo;
}

module.exports = { leerId, esFechaValida, hoy, textoValido };
