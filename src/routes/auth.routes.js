const { Router } = require('express');
const { registro, login, perfil } = require('../controllers/auth.controller');
const verificarToken = require('../middleware/auth');

const router = Router();

router.post('/registro', registro);           // pública
router.post('/login', login);                 // pública
router.get('/perfil', verificarToken, perfil); // protegida con JWT

module.exports = router;