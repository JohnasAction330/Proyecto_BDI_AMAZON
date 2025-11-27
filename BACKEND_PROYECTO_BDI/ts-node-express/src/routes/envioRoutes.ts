import { Router } from 'express';
import * as enviosController from '../controllers/enviosController';

const router = Router();

router.post('/', enviosController.crearEnvio);
router.get('/pedido/:idPedido', enviosController.obtenerEnvioPorPedido);
router.get('/:idEnvio', enviosController.obtenerEnvioPorId);
router.put('/:idEnvio/estado', enviosController.actualizarEstadoEnvio);

export default router;
