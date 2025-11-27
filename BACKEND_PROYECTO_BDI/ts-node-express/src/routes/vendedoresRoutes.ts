import { Router } from 'express';
import * as vendedoresController from '../controllers/vendedoresController';

const router = Router();

router.get('/', vendedoresController.obtenerVendedores);
router.get('/:id', vendedoresController.obtenerVendedorPorId);
router.post('/', vendedoresController.crearVendedor);
router.put('/:id/estado', vendedoresController.actualizarEstadoVendedor);
router.get('/:id/pedidos', vendedoresController.obtenerPedidosDeVendedor);

export default router;
