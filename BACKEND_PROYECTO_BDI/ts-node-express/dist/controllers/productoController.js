"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerProductosMasVendidos = exports.obtenerPromedioCalificacion = exports.obtenerResenasDeProducto = exports.asignarCategoriaAProducto = exports.obtenerCategoriasDeProducto = exports.obtenerProductosConSKUs = exports.obtenerProductosPorMarca = exports.buscarProductosPorNombre = exports.eliminarProducto = exports.actualizarProducto = exports.crearProducto = exports.obtenerProductoPorId = exports.obtenerProductos = void 0;
const database_1 = __importDefault(require("../config/database"));
const obtenerProductos = async (req, res) => {
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT p.ID_PRODUCTO, p.NOMBRE, p.MARCA 
       FROM TBL_PRODUCTO p 
       ORDER BY p.ID_PRODUCTO`, [], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        res.json({
            success: true,
            count: result.rows?.length || 0,
            data: result.rows
        });
    }
    catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos'
        });
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
};
exports.obtenerProductos = obtenerProductos;
const obtenerProductoPorId = async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT p.ID_PRODUCTO, p.NOMBRE, p.MARCA 
       FROM TBL_PRODUCTO p 
       WHERE p.ID_PRODUCTO = :id`, [id], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        if (result.rows && result.rows.length > 0) {
            res.json({
                success: true,
                data: result.rows[0]
            });
        }
        else {
            res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
    }
    catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener producto'
        });
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
};
exports.obtenerProductoPorId = obtenerProductoPorId;
const crearProducto = async (req, res) => {
    const { nombre, marca } = req.body;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`INSERT INTO TBL_PRODUCTO (ID_PRODUCTO, NOMBRE, MARCA) 
       VALUES (SEQ_PRODUCTO.NEXTVAL, :nombre, :marca) 
       RETURNING ID_PRODUCTO INTO :id`, {
            nombre,
            marca,
            id: { dir: database_1.default.BIND_OUT, type: database_1.default.NUMBER }
        }, { autoCommit: true });
        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: { id: result.outBinds?.id }
        });
    }
    catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear producto'
        });
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
};
exports.crearProducto = crearProducto;
const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, marca } = req.body;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`UPDATE TBL_PRODUCTO 
       SET NOMBRE = :nombre, MARCA = :marca 
       WHERE ID_PRODUCTO = :id`, { nombre, marca, id }, { autoCommit: true });
        if (result.rowsAffected && result.rowsAffected > 0) {
            res.json({
                success: true,
                message: 'Producto actualizado exitosamente'
            });
        }
        else {
            res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
    }
    catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar producto'
        });
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
};
exports.actualizarProducto = actualizarProducto;
const eliminarProducto = async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        await connection.execute(`DELETE FROM TBL_RESENA WHERE ID_PRODUCTO = :id`, [id]);
        await connection.execute(`DELETE FROM TBL_WISH_LIST WHERE ID_PRODUCTO = :id`, [id]);
        await connection.execute(`DELETE FROM TBL_IMAGEN_PRODUCTO WHERE ID_PRODUCTO = :id`, [id]);
        await connection.execute(`DELETE FROM TBL_OFERTAS_PRODUCTO WHERE ID_PRODUCTO = :id`, [id]);
        await connection.execute(`DELETE FROM TBL_SKU_PRODUCTO 
       WHERE ID_SKU IN (SELECT ID_SKU FROM TBL_SKU WHERE ID_PRODUCTO = :id)`, [id]);
        await connection.execute(`DELETE FROM TBL_CARRITO_ITEM 
       WHERE ID_SKU IN (SELECT ID_SKU FROM TBL_SKU WHERE ID_PRODUCTO = :id)`, [id]);
        await connection.execute(`DELETE FROM TBL_PEDIDO_ITEM
        WHERE ID_SKU IN (
        SELECT ID_SKU FROM TBL_SKU WHERE ID_PRODUCTO = :id
        )`, [id]);
        await connection.execute(`DELETE FROM TBL_CARRITO_ITEM
        WHERE ID_SKU IN (
        SELECT ID_SKU FROM TBL_SKU WHERE ID_PRODUCTO = :id
        )`, [id]);
        await connection.execute(`DELETE FROM TBL_SKU_PRODUCTO
        WHERE ID_SKU IN (
        SELECT ID_SKU FROM TBL_SKU WHERE ID_PRODUCTO = :id
        )`, [id]);
        await connection.execute(`DELETE FROM TBL_SKU WHERE ID_PRODUCTO = :id`, [id]);
        await connection.execute(`DELETE FROM TBL_SKU WHERE ID_PRODUCTO = :id`, [id]);
        await connection.execute(`DELETE FROM TBL_PRODUCTO_CATEGORIA WHERE ID_PRODUCTO = :id`, [id]);
        const result = await connection.execute(`DELETE FROM TBL_PRODUCTO WHERE ID_PRODUCTO = :id`, [id]);
        await connection.commit();
        if (result.rowsAffected && result.rowsAffected > 0) {
            res.json({
                success: true,
                message: 'Producto y todas sus dependencias eliminadas exitosamente'
            });
        }
        else {
            res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
    }
    catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error al eliminar producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar producto'
        });
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
};
exports.eliminarProducto = eliminarProducto;
const buscarProductosPorNombre = async (req, res) => {
    const { nombre } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT p.ID_PRODUCTO, p.NOMBRE, p.MARCA 
       FROM TBL_PRODUCTO p 
       WHERE UPPER(p.NOMBRE) LIKE UPPER(:nombre)
       ORDER BY p.NOMBRE`, [`%${nombre}%`], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        res.json({
            success: true,
            count: result.rows?.length || 0,
            data: result.rows
        });
    }
    catch (error) {
        console.error('Error al buscar productos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar productos'
        });
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
};
exports.buscarProductosPorNombre = buscarProductosPorNombre;
const obtenerProductosPorMarca = async (req, res) => {
    const { marca } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT p.ID_PRODUCTO, p.NOMBRE, p.MARCA 
       FROM TBL_PRODUCTO p 
       WHERE UPPER(p.MARCA) = UPPER(:marca)
       ORDER BY p.NOMBRE`, [marca], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        res.json({
            success: true,
            count: result.rows?.length || 0,
            data: result.rows
        });
    }
    catch (error) {
        console.error('Error al obtener productos por marca:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos por marca'
        });
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
};
exports.obtenerProductosPorMarca = obtenerProductosPorMarca;
const obtenerProductosConSKUs = async (req, res) => {
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT 
        p.ID_PRODUCTO,
        p.NOMBRE,
        p.MARCA,
        s.ID_SKU,
        s.PRECIO,
        s.STOCK
       FROM TBL_PRODUCTO p
       LEFT JOIN TBL_SKU s ON p.ID_PRODUCTO = s.ID_PRODUCTO
       ORDER BY p.ID_PRODUCTO, s.ID_SKU`, [], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        const productosMap = new Map();
        result.rows?.forEach((row) => {
            if (!productosMap.has(row.ID_PRODUCTO)) {
                productosMap.set(row.ID_PRODUCTO, {
                    id_producto: row.ID_PRODUCTO,
                    nombre: row.NOMBRE,
                    marca: row.MARCA,
                    skus: []
                });
            }
            if (row.ID_SKU) {
                productosMap.get(row.ID_PRODUCTO).skus.push({
                    id_sku: row.ID_SKU,
                    precio: row.PRECIO,
                    stock: row.STOCK
                });
            }
        });
        const productos = Array.from(productosMap.values());
        res.json({
            success: true,
            count: productos.length,
            data: productos
        });
    }
    catch (error) {
        console.error('Error al obtener productos con SKUs:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos con SKUs'
        });
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
};
exports.obtenerProductosConSKUs = obtenerProductosConSKUs;
const obtenerCategoriasDeProducto = async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT c.ID_CATEGORIA, c.NOMBRE, c.DESCRIPCION
       FROM TBL_CATEGORIA c
       INNER JOIN TBL_PRODUCTO_CATEGORIA pc ON c.ID_CATEGORIA = pc.ID_CATEGORIA
       WHERE pc.ID_PRODUCTO = :id`, [id], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        res.json({
            success: true,
            count: result.rows?.length || 0,
            data: result.rows
        });
    }
    catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener categorías del producto'
        });
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
};
exports.obtenerCategoriasDeProducto = obtenerCategoriasDeProducto;
const asignarCategoriaAProducto = async (req, res) => {
    const { id } = req.params;
    const { id_categoria } = req.body;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        await connection.execute(`INSERT INTO TBL_PRODUCTO_CATEGORIA (ID_PRODUCTO, ID_CATEGORIA)
       VALUES (:id_producto, :id_categoria)`, { id_producto: id, id_categoria }, { autoCommit: true });
        res.status(201).json({
            success: true,
            message: 'Categoría asignada exitosamente'
        });
    }
    catch (error) {
        console.error('Error al asignar categoría:', error);
        if (error.errorNum === 1) {
            res.status(400).json({
                success: false,
                message: 'Esta categoría ya está asignada al producto'
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Error al asignar categoría'
            });
        }
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
};
exports.asignarCategoriaAProducto = asignarCategoriaAProducto;
const obtenerResenasDeProducto = async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT 
        r.ID_RESENA,
        r.CALIFICACION,
        r.COMENTARIO,
        r.FECHA_RESENA,
        r.VERIFICADO,
        u.NOMBRE || ' ' || u.APELLIDO AS CLIENTE
       FROM TBL_RESENA r
       INNER JOIN TBL_CLIENTE c ON r.ID_CLIENTE = c.ID_CLIENTE
       INNER JOIN TBL_USUARIOS u ON c.ID_USUARIO = u.ID_USUARIO
       WHERE r.ID_PRODUCTO = :id
       ORDER BY r.FECHA_RESENA DESC`, [id], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        res.json({
            success: true,
            count: result.rows?.length || 0,
            data: result.rows
        });
    }
    catch (error) {
        console.error('Error al obtener reseñas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener reseñas del producto'
        });
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
};
exports.obtenerResenasDeProducto = obtenerResenasDeProducto;
const obtenerPromedioCalificacion = async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT 
        AVG(CALIFICACION) AS PROMEDIO,
        COUNT(*) AS TOTAL_RESENAS
       FROM TBL_RESENA
       WHERE ID_PRODUCTO = :id`, [id], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        res.json({
            success: true,
            data: result.rows?.[0]
        });
    }
    catch (error) {
        console.error('Error al obtener promedio:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener promedio de calificación'
        });
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
};
exports.obtenerPromedioCalificacion = obtenerPromedioCalificacion;
const obtenerProductosMasVendidos = async (req, res) => {
    const { limite = 10 } = req.query;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT 
        p.ID_PRODUCTO,
        p.NOMBRE,
        p.MARCA,
        SUM(pi.CANTIDAD) AS TOTAL_VENDIDO
       FROM TBL_PRODUCTO p
       INNER JOIN TBL_SKU s ON p.ID_PRODUCTO = s.ID_PRODUCTO
       INNER JOIN TBL_PEDIDO_ITEM pi ON s.ID_SKU = pi.ID_SKU
       GROUP BY p.ID_PRODUCTO, p.NOMBRE, p.MARCA
       ORDER BY TOTAL_VENDIDO DESC
       FETCH FIRST :limite ROWS ONLY`, [limite], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        res.json({
            success: true,
            count: result.rows?.length || 0,
            data: result.rows
        });
    }
    catch (error) {
        console.error('Error al obtener productos más vendidos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos más vendidos'
        });
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
};
exports.obtenerProductosMasVendidos = obtenerProductosMasVendidos;
//# sourceMappingURL=productoController.js.map