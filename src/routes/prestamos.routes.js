const { Router } = require('express');
const verificarToken = require('../middleware/auth');
const prestamos = require('../controllers/prestamos.controller');

const router = Router();

// Todas las rutas de préstamos están protegidas con JWT
router.use(verificarToken);

router.get('/', prestamos.listar);
router.post('/', prestamos.crear);
router.put('/:id/devolucion', prestamos.devolver);

module.exports = router;
