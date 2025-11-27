"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerProductosPorCategoria = exports.eliminarCategoria = exports.actualizarCategoria = exports.crearCategoria = exports.obtenerCategoriaPorId = exports.obtenerCategorias = void 0;
const database_1 = __importDefault(require("../config/database"));
const obtenerCategorias = async (req, res) => {
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT ID_CATEGORIA, NOMBRE, DESCRIPCION, ID_CATEGORIA_PADRE
         FROM TBL_CATEGORIA
        ORDER BY ID_CATEGORIA`, [], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        res.json({ success: true, count: result.rows?.length || 0, data: result.rows });
    }
    catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ success: false, message: 'Error al obtener categorías' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.obtenerCategorias = obtenerCategorias;
const obtenerCategoriaPorId = async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT ID_CATEGORIA, NOMBRE, DESCRIPCION, ID_CATEGORIA_PADRE
         FROM TBL_CATEGORIA
        WHERE ID_CATEGORIA = :id`, [id], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        if (result.rows && result.rows.length > 0) {
            res.json({ success: true, data: result.rows[0] });
        }
        else {
            res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }
    }
    catch (error) {
        console.error('Error al obtener categoría:', error);
        res.status(500).json({ success: false, message: 'Error al obtener categoría' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.obtenerCategoriaPorId = obtenerCategoriaPorId;
const crearCategoria = async (req, res) => {
    const { nombre, descripcion, id_categoria_padre } = req.body;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`INSERT INTO TBL_CATEGORIA (ID_CATEGORIA, NOMBRE, DESCRIPCION, ID_CATEGORIA_PADRE)
       VALUES (SEQ_CATEGORIA.NEXTVAL, :nombre, :descripcion, :padre)
       RETURNING ID_CATEGORIA INTO :id`, {
            nombre,
            descripcion,
            padre: id_categoria_padre || null,
            id: { dir: database_1.default.BIND_OUT, type: database_1.default.NUMBER }
        }, { autoCommit: true });
        res.status(201).json({
            success: true,
            message: 'Categoría creada',
            data: { id: result.outBinds?.id[0] }
        });
    }
    catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({ success: false, message: 'Error al crear categoría' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.crearCategoria = crearCategoria;
const actualizarCategoria = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, id_categoria_padre } = req.body;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`UPDATE TBL_CATEGORIA
          SET NOMBRE = :nombre,
              DESCRIPCION = :descripcion,
              ID_CATEGORIA_PADRE = :padre
        WHERE ID_CATEGORIA = :id`, {
            nombre,
            descripcion,
            padre: id_categoria_padre || null,
            id
        }, { autoCommit: true });
        if (result.rowsAffected && result.rowsAffected > 0) {
            res.json({ success: true, message: 'Categoría actualizada' });
        }
        else {
            res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }
    }
    catch (error) {
        console.error('Error al actualizar categoría:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar categoría' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.actualizarCategoria = actualizarCategoria;
const eliminarCategoria = async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        await connection.execute(`DELETE FROM TBL_PRODUCTO_CATEGORIA WHERE ID_CATEGORIA = :id`, [id], { autoCommit: false });
        const result = await connection.execute(`DELETE FROM TBL_CATEGORIA WHERE ID_CATEGORIA = :id`, [id], { autoCommit: false });
        await connection.commit();
        if (result.rowsAffected && result.rowsAffected > 0) {
            res.json({ success: true, message: 'Categoría eliminada' });
        }
        else {
            res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }
    }
    catch (error) {
        console.error('Error al eliminar categoría:', error);
        if (connection)
            await connection.rollback();
        res.status(500).json({ success: false, message: 'Error al eliminar categoría' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.eliminarCategoria = eliminarCategoria;
const obtenerProductosPorCategoria = async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT 
         p.ID_PRODUCTO,
         p.NOMBRE,
         p.MARCA
       FROM TBL_PRODUCTO p
       JOIN TBL_PRODUCTO_CATEGORIA pc
         ON p.ID_PRODUCTO = pc.ID_PRODUCTO
      WHERE pc.ID_CATEGORIA = :id`, [id], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        res.json({ success: true, count: result.rows?.length || 0, data: result.rows });
    }
    catch (error) {
        console.error('Error al obtener productos por categoría:', error);
        res.status(500).json({ success: false, message: 'Error al obtener productos por categoría' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.obtenerProductosPorCategoria = obtenerProductosPorCategoria;
//# sourceMappingURL=categoriasController.js.map