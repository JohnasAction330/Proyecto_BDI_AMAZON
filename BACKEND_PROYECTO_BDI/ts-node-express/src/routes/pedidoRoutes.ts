import { Router } from 'express';
import * as pedidosController from '../controllers/pedidosController';

const router = Router();

router.post('/cliente/:idCliente', pedidosController.crearPedidoDesdeCarrito);
router.get('/cliente/:idCliente', pedidosController.obtenerPedidosDeCliente);
router.get('/:idPedido', pedidosController.obtenerDetallePedido);
router.put('/:idPedido/estado', pedidosController.actualizarEstadoPedido);

export default router;
