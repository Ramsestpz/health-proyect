const { Router } = require('express');
const authService = require('../services/auth.service');
const requireAuth = require('../middlewares/auth');
const { validate, registerRules, loginRules } = require('../middlewares/validate');

const router = Router();

// Las rutas solo reciben la petición, llaman al servicio y responden.
// Express 5 envía automáticamente al errorHandler cualquier error de una función async.

router.post('/register', validate(registerRules), async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ ok: true, message: 'Cuenta creada correctamente', data: result });
});

router.post('/login', validate(loginRules), async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({ ok: true, message: 'Bienvenido', data: result });
});

router.get('/me', requireAuth, (req, res) => {
  res.status(200).json({ ok: true, data: authService.me(req.user) });
});

module.exports = router;
