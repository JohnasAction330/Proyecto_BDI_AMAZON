import { Router } from 'express';
import * as skuController from '../controllers/skuController';

const router = Router();

router.get('/producto/:idProducto', skuController.obtenerSkusPorProducto);
router.post('/', skuController.crearSku);
router.put('/:idSku', skuController.actualizarSku);
router.delete('/:idSku', skuController.eliminarSku);
router.get('/:idSku/atributos', skuController.obtenerAtributosDeSku);
router.post('/:idSku/atributos', skuController.asignarAtributoASku);

export default router;
