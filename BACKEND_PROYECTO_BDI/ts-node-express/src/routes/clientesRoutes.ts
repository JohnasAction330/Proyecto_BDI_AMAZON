import { Router } from 'express';
import * as clientesController from '../controllers/clientesController';

const router = Router();

router.get('/', clientesController.obtenerClientes);
router.get('/:id', clientesController.obtenerClientePorId);
router.post('/', clientesController.crearCliente);
router.put('/:id/estado', clientesController.actualizarEstadoCliente);
router.get('/:id/direcciones', clientesController.obtenerDireccionesCliente);
router.get('/:id/pedidos', clientesController.obtenerPedidosCliente);
router.get('/:id/wishlist', clientesController.obtenerWishlistCliente);

export default router;
