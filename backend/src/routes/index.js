const { Router } = require('express');
const requireAuth = require('../middlewares/auth');

const router = Router();

// Pública: login y registro
router.use('/auth', require('./auth.routes'));

// Todo lo demás exige sesión iniciada (401 si no hay token válido)
router.use('/categories', requireAuth, require('./category.routes'));
router.use('/specialties', requireAuth, require('./specialty.routes'));
router.use('/doctors', requireAuth, require('./doctor.routes'));
router.use('/locations', requireAuth, require('./location.routes'));
router.use('/zones', requireAuth, require('./zone.routes'));

module.exports = router;
