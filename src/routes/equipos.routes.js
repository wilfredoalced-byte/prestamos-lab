const { Router } = require('express');
const verificarToken = require('../middleware/auth');
const equipos = require('../controllers/equipos.controller');

const router = Router();

// Todas las rutas de equipos están protegidas con JWT
router.use(verificarToken);

router.get('/', equipos.listar);
router.post('/', equipos.crear);
router.get('/:id', equipos.obtener);
router.put('/:id', equipos.actualizar);
router.delete('/:id', equipos.eliminar);

module.exports = router;
