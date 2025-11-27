"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerPedidosDeVendedor = exports.actualizarEstadoVendedor = exports.crearVendedor = exports.obtenerVendedorPorId = exports.obtenerVendedores = void 0;
const database_1 = __importDefault(require("../config/database"));
const obtenerVendedores = async (req, res) => {
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT 
         v.ID_VENDEDOR,
         v.ID_ESTADO,
         e.NOMBRE AS ESTADO,
         u.ID_USUARIO,
         u.NOMBRE,
         u.APELLIDO,
         u.CORREO
       FROM TBL_VENDEDORES v
       JOIN TBL_USUARIOS u ON v.ID_USUARIO = u.ID_USUARIO
       JOIN TBL_ESTADO e ON v.ID_ESTADO = e.ID_ESTADO
      ORDER BY v.ID_VENDEDOR`, [], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        res.json({ success: true, count: result.rows?.length || 0, data: result.rows });
    }
    catch (error) {
        console.error('Error al obtener vendedores:', error);
        res.status(500).json({ success: false, message: 'Error al obtener vendedores' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.obtenerVendedores = obtenerVendedores;
const obtenerVendedorPorId = async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT 
         v.ID_VENDEDOR,
         v.ID_ESTADO,
         e.NOMBRE AS ESTADO,
         u.ID_USUARIO,
         u.NOMBRE,
         u.APELLIDO,
         u.CORREO
       FROM TBL_VENDEDORES v
       JOIN TBL_USUARIOS u ON v.ID_USUARIO = u.ID_USUARIO
       JOIN TBL_ESTADO e ON v.ID_ESTADO = e.ID_ESTADO
      WHERE v.ID_VENDEDOR = :id`, [id], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        if (result.rows && result.rows.length > 0) {
            res.json({ success: true, data: result.rows[0] });
        }
        else {
            res.status(404).json({ success: false, message: 'Vendedor no encontrado' });
        }
    }
    catch (error) {
        console.error('Error al obtener vendedor:', error);
        res.status(500).json({ success: false, message: 'Error al obtener vendedor' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.obtenerVendedorPorId = obtenerVendedorPorId;
const crearVendedor = async (req, res) => {
    const { id_usuario, id_estado } = req.body;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`INSERT INTO TBL_VENDEDORES (ID_VENDEDOR, ID_USUARIO, ID_ESTADO)
       VALUES (SEQ_VENDEDOR.NEXTVAL, :idUsuario, :idEstado)
       RETURNING ID_VENDEDOR INTO :id`, {
            idUsuario: id_usuario,
            idEstado: id_estado,
            id: { dir: database_1.default.BIND_OUT, type: database_1.default.NUMBER }
        }, { autoCommit: true });
        res.status(201).json({
            success: true,
            message: 'Vendedor creado',
            data: { id: result.outBinds?.id[0] }
        });
    }
    catch (error) {
        console.error('Error al crear vendedor:', error);
        res.status(500).json({ success: false, message: 'Error al crear vendedor' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.crearVendedor = crearVendedor;
const actualizarEstadoVendedor = async (req, res) => {
    const { id } = req.params;
    const { id_estado } = req.body;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`UPDATE TBL_VENDEDORES
          SET ID_ESTADO = :idEstado
        WHERE ID_VENDEDOR = :id`, { idEstado: id_estado, id }, { autoCommit: true });
        if (result.rowsAffected && result.rowsAffected > 0) {
            res.json({ success: true, message: 'Estado de vendedor actualizado' });
        }
        else {
            res.status(404).json({ success: false, message: 'Vendedor no encontrado' });
        }
    }
    catch (error) {
        console.error('Error al actualizar estado del vendedor:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar estado del vendedor' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.actualizarEstadoVendedor = actualizarEstadoVendedor;
const obtenerPedidosDeVendedor = async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT 
         pi.ID_PEDIDO_ITEM,
         pi.ID_PEDIDO,
         pi.CANTIDAD,
         s.ID_SKU,
         s.PRECIO,
         p.ID_PRODUCTO,
         p.NOMBRE,
         p.MARCA
       FROM TBL_PEDIDO_ITEM pi
       JOIN TBL_SKU s ON pi.ID_SKU = s.ID_SKU
       JOIN TBL_PRODUCTO p ON s.ID_PRODUCTO = p.ID_PRODUCTO
      WHERE pi.ID_VENDEDOR = :id`, [id], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        res.json({ success: true, count: result.rows?.length || 0, data: result.rows });
    }
    catch (error) {
        console.error('Error al obtener pedidos de vendedor:', error);
        res.status(500).json({ success: false, message: 'Error al obtener pedidos de vendedor' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.obtenerPedidosDeVendedor = obtenerPedidosDeVendedor;
//# sourceMappingURL=vendedoresController.js.map