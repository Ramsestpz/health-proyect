const { Router } = require('express');
const zoneService = require('../services/zone.service');
const validateId = require('../middlewares/validateId');
const { validate, zoneRules, zoneCreateRules } = require('../middlewares/validate');

// Rutas de zonas (polígonos dibujados en el mapa)
const router = Router();

router.get('/', async (req, res) => {
  const data = await zoneService.list();
  res.status(200).json({ ok: true, data });
});

router.post('/', validate(zoneCreateRules), async (req, res) => {
  const data = await zoneService.create(req.body, req.user);
  res.status(201).json({ ok: true, message: 'Zona guardada', data });
});

router.put('/:id', validateId, validate(zoneRules), async (req, res) => {
  const data = await zoneService.update(req.params.id, req.body);
  res.status(200).json({ ok: true, message: 'Zona actualizada', data });
});

router.delete('/:id', validateId, async (req, res) => {
  await zoneService.remove(req.params.id);
  res.status(200).json({ ok: true, message: 'Zona eliminada' });
});

module.exports = router;
