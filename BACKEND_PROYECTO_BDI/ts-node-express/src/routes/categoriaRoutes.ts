import { Router } from 'express';
import * as categoriasController from '../controllers/categoriasController';

const router = Router();

router.get('/', categoriasController.obtenerCategorias);
router.get('/:id', categoriasController.obtenerCategoriaPorId);
router.post('/', categoriasController.crearCategoria);
router.put('/:id', categoriasController.actualizarCategoria);
router.delete('/:id', categoriasController.eliminarCategoria);
router.get('/:id/productos', categoriasController.obtenerProductosPorCategoria);

export default router;
