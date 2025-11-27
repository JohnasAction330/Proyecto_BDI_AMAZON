import { Router } from 'express';
import * as pagosController from '../controllers/pagosController';

const router = Router();
router.post('/', pagosController.crearPago);
router.get('/pedido/:idPedido', pagosController.obtenerPagoPorPedido);
router.get('/:idPago', pagosController.obtenerPagoPorId);
router.put('/:idPago/estado', pagosController.actualizarEstadoPago);

export default router;
