const { Router } = require('express');
const specialtyService = require('../services/specialty.service');
const validateId = require('../middlewares/validateId');
const { validate, specialtyRules } = require('../middlewares/validate');

// Rutas de especialidades médicas
// Las rutas solo reciben la petición, llaman al servicio y responden con el código HTTP correcto.
const router = Router();

// GET /api/specialties → listar (200)
router.get('/', async (req, res) => {
  const data = await specialtyService.list(req.query);
  res.status(200).json({ ok: true, data });
});

// GET /api/specialties/:id → ver uno (200 | 404)
router.get('/:id', validateId, async (req, res) => {
  const data = await specialtyService.getById(req.params.id);
  res.status(200).json({ ok: true, data });
});

// POST /api/specialties → crear (201 | 400)
router.post('/', validate(specialtyRules), async (req, res) => {
  const data = await specialtyService.create(req.body, req.user);
  res.status(201).json({ ok: true, message: 'Especialidad creada', data });
});

// PUT /api/specialties/:id → editar (200 | 400 | 404)
router.put('/:id', validateId, validate(specialtyRules), async (req, res) => {
  const data = await specialtyService.update(req.params.id, req.body);
  res.status(200).json({ ok: true, message: 'Especialidad actualizada', data });
});

// DELETE /api/specialties/:id → eliminar (200 | 400 | 404)
router.delete('/:id', validateId, async (req, res) => {
  await specialtyService.remove(req.params.id);
  res.status(200).json({ ok: true, message: 'Especialidad eliminada' });
});

module.exports = router;
