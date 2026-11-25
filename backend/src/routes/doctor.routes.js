const { Router } = require('express');
const doctorService = require('../services/doctor.service');
const validateId = require('../middlewares/validateId');
const { validate, doctorRules } = require('../middlewares/validate');

// Rutas de médicos (relación con especialidad y establecimiento)
// Las rutas solo reciben la petición, llaman al servicio y responden con el código HTTP correcto.
const router = Router();

// GET /api/doctors → listar (200)
router.get('/', async (req, res) => {
  const data = await doctorService.list(req.query);
  res.status(200).json({ ok: true, data });
});

// GET /api/doctors/:id → ver uno (200 | 404)
router.get('/:id', validateId, async (req, res) => {
  const data = await doctorService.getById(req.params.id);
  res.status(200).json({ ok: true, data });
});

// POST /api/doctors → crear (201 | 400)
router.post('/', validate(doctorRules), async (req, res) => {
  const data = await doctorService.create(req.body, req.user);
  res.status(201).json({ ok: true, message: 'Médico registrado', data });
});

// PUT /api/doctors/:id → editar (200 | 400 | 404)
router.put('/:id', validateId, validate(doctorRules), async (req, res) => {
  const data = await doctorService.update(req.params.id, req.body);
  res.status(200).json({ ok: true, message: 'Médico actualizado', data });
});

// DELETE /api/doctors/:id → eliminar (200 | 400 | 404)
router.delete('/:id', validateId, async (req, res) => {
  await doctorService.remove(req.params.id);
  res.status(200).json({ ok: true, message: 'Médico eliminado' });
});

module.exports = router;
