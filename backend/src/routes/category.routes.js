const { Router } = require('express');
const categoryService = require('../services/category.service');
const validateId = require('../middlewares/validateId');
const { validate, categoryRules } = require('../middlewares/validate');

// Rutas de categorías (tipos de establecimiento)
// Las rutas solo reciben la petición, llaman al servicio y responden con el código HTTP correcto.
const router = Router();

// GET /api/categories → listar (200)
router.get('/', async (req, res) => {
  const data = await categoryService.list(req.query);
  res.status(200).json({ ok: true, data });
});

// GET /api/categories/:id → ver uno (200 | 404)
router.get('/:id', validateId, async (req, res) => {
  const data = await categoryService.getById(req.params.id);
  res.status(200).json({ ok: true, data });
});

// POST /api/categories → crear (201 | 400)
router.post('/', validate(categoryRules), async (req, res) => {
  const data = await categoryService.create(req.body, req.user);
  res.status(201).json({ ok: true, message: 'Categoría creada', data });
});

// PUT /api/categories/:id → editar (200 | 400 | 404)
router.put('/:id', validateId, validate(categoryRules), async (req, res) => {
  const data = await categoryService.update(req.params.id, req.body);
  res.status(200).json({ ok: true, message: 'Categoría actualizada', data });
});

// DELETE /api/categories/:id → eliminar (200 | 400 | 404)
router.delete('/:id', validateId, async (req, res) => {
  await categoryService.remove(req.params.id);
  res.status(200).json({ ok: true, message: 'Categoría eliminada' });
});

module.exports = router;
