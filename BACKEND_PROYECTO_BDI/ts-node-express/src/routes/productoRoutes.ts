import { Router } from 'express';
import {obtenerProductoPorId, obtenerProductos, crearProducto,actualizarProducto,eliminarProducto,
    buscarProductosPorNombre,obtenerProductosPorMarca,obtenerProductosConSKUs,obtenerCategoriasDeProducto,asignarCategoriaAProducto,obtenerResenasDeProducto,
    obtenerPromedioCalificacion,obtenerProductosMasVendidos
} from '../controllers/productoController';

const router = Router();

router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id',eliminarProducto);

router.get('/buscar/:nombre', buscarProductosPorNombre);
router.get('/marca/:marca', obtenerProductosPorMarca);

router.get('/completo/skus', obtenerProductosConSKUs);
router.get('/:id/categorias', obtenerCategoriasDeProducto);
router.post('/:id/categorias', asignarCategoriaAProducto);

router.get('/:id/resenas', obtenerResenasDeProducto);
router.get('/:id/calificacion', obtenerPromedioCalificacion);

router.get('/estadisticas/mas-vendidos',obtenerProductosMasVendidos);



export default router;
