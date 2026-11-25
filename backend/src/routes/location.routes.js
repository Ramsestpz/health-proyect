const { Router } = require('express');
const locationService = require('../services/location.service');
const validateId = require('../middlewares/validateId');
const { validate, locationRules } = require('../middlewares/validate');

// Rutas de ubicaciones exactas (establecimientos de salud en el mapa)
const router = Router();

// GET /api/locations?search=&category=&status=&zone=&open24h=  → búsqueda y filtros en el backend
router.get('/', async (req, res) => {
  const data = await locationService.list(req.query);
  res.status(200).json({ ok: true, total: data.length, data });
});

// GET /api/locations/nearby?lng=&lat=&maxDistance=&category=  → más cercanos ($geoNear)
// Va antes de "/:id" para que "nearby" no se interprete como un id.
router.get('/nearby', async (req, res) => {
  const data = await locationService.nearby(req.query);
  res.status(200).json({ ok: true, total: data.length, data });
});

router.get('/:id', validateId, async (req, res) => {
  const data = await locationService.getById(req.params.id);
  res.status(200).json({ ok: true, data });
});

router.post('/', validate(locationRules), async (req, res) => {
  const data = await locationService.create(req.body, req.user);
  res.status(201).json({ ok: true, message: 'Ubicación registrada', data });
});

router.put('/:id', validateId, validate(locationRules), async (req, res) => {
  const data = await locationService.update(req.params.id, req.body);
  res.status(200).json({ ok: true, message: 'Ubicación actualizada', data });
});

router.delete('/:id', validateId, async (req, res) => {
  const { deletedDoctors } = await locationService.remove(req.params.id);
  const extra = deletedDoctors > 0 ? ` (y ${deletedDoctors} médico(s) asignado(s))` : '';
  res.status(200).json({ ok: true, message: `Ubicación eliminada${extra}` });
});

module.exports = router;
