import { Router } from 'express';
import * as carritoController from '../controllers/carritoController';

const router = Router();

router.get('/cliente/:idCliente', carritoController.obtenerCarritoCliente);
router.post('/cliente/:idCliente/items', carritoController.agregarItemCarrito);
router.put('/cliente/:idCliente/items/:idSku', carritoController.actualizarCantidadItem);
router.delete('/cliente/:idCliente/items/:idSku', carritoController.eliminarItemCarrito);
router.delete('/cliente/:idCliente', carritoController.vaciarCarrito);

export default router;
