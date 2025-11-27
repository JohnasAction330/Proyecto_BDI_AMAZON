"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerWishlistCliente = exports.obtenerPedidosCliente = exports.obtenerDireccionesCliente = exports.actualizarEstadoCliente = exports.crearCliente = exports.obtenerClientePorId = exports.obtenerClientes = void 0;
const database_1 = __importDefault(require("../config/database"));
const obtenerClientes = async (req, res) => {
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT 
         c.ID_CLIENTE,
         c.ID_ESTADO,
         e.NOMBRE AS ESTADO,
         u.ID_USUARIO,
         u.NOMBRE,
         u.APELLIDO,
         u.CORREO
       FROM TBL_CLIENTE c
       JOIN TBL_USUARIOS u ON c.ID_USUARIO = u.ID_USUARIO
       JOIN TBL_ESTADO e ON c.ID_ESTADO = e.ID_ESTADO
       ORDER BY c.ID_CLIENTE`, [], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        res.json({ success: true, count: result.rows?.length || 0, data: result.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al obtener clientes' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.obtenerClientes = obtenerClientes;
const obtenerClientePorId = async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT 
         c.ID_CLIENTE,
         c.ID_ESTADO,
         e.NOMBRE AS ESTADO,
         u.ID_USUARIO,
         u.NOMBRE,
         u.APELLIDO,
         u.CORREO,
         u.FECHA_REGISTRO,
         u.FECHA_NACIMIENTO
       FROM TBL_CLIENTE c
       JOIN TBL_USUARIOS u ON c.ID_USUARIO = u.ID_USUARIO
       JOIN TBL_ESTADO e ON c.ID_ESTADO = e.ID_ESTADO
       WHERE c.ID_CLIENTE = :id`, [id], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        if (result.rows && result.rows.length > 0) {
            res.json({ success: true, data: result.rows[0] });
        }
        else {
            res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al obtener cliente' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.obtenerClientePorId = obtenerClientePorId;
const crearCliente = async (req, res) => {
    const { id_usuario, id_estado } = req.body;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`INSERT INTO TBL_CLIENTE (ID_CLIENTE, ID_USUARIO, ID_ESTADO)
       VALUES (SEQ_CLIENTE.NEXTVAL, :id_usuario, :id_estado)
       RETURNING ID_CLIENTE INTO :id`, {
            id_usuario,
            id_estado,
            id: { dir: database_1.default.BIND_OUT, type: database_1.default.NUMBER }
        }, { autoCommit: true });
        res.status(201).json({
            success: true,
            message: 'Cliente creado exitosamente',
            data: { id: result.outBinds?.id }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al crear cliente' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.crearCliente = crearCliente;
const actualizarEstadoCliente = async (req, res) => {
    const { id } = req.params;
    const { id_estado } = req.body;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`UPDATE TBL_CLIENTE 
         SET ID_ESTADO = :id_estado
       WHERE ID_CLIENTE = :id`, { id_estado, id }, { autoCommit: true });
        if (result.rowsAffected && result.rowsAffected > 0) {
            res.json({ success: true, message: 'Estado de cliente actualizado' });
        }
        else {
            res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al actualizar estado' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.actualizarEstadoCliente = actualizarEstadoCliente;
const obtenerDireccionesCliente = async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT 
         ID_DIRECCION,
         CALLE,
         CIUDAD,
         DEPARTAMENTO,
         CODIGO_POSTAL,
         PAIS,
         TIPO_DIRECCION
       FROM TBL_DIRECCION
       WHERE ID_CLIENTE = :id
       ORDER BY ID_DIRECCION`, [id], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        res.json({ success: true, count: result.rows?.length || 0, data: result.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al obtener direcciones' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.obtenerDireccionesCliente = obtenerDireccionesCliente;
const obtenerPedidosCliente = async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT 
         ID_PEDIDO,
         FECHA_PEDIDO,
         ESTADO,
         TOTAL,
         SUBTOTAL,
         IMPUESTOS
       FROM TBL_PEDIDO
       WHERE ID_CLIENTE = :id
       ORDER BY FECHA_PEDIDO DESC`, [id], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        res.json({ success: true, count: result.rows?.length || 0, data: result.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al obtener pedidos del cliente' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.obtenerPedidosCliente = obtenerPedidosCliente;
const obtenerWishlistCliente = async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT 
         w.ID_PRODUCTO,
         p.NOMBRE,
         p.MARCA,
         w.FECHA_AGREGADO
       FROM TBL_WISH_LIST w
       JOIN TBL_PRODUCTO p ON w.ID_PRODUCTO = p.ID_PRODUCTO
       WHERE w.ID_CLIENTE = :id
       ORDER BY w.FECHA_AGREGADO DESC`, [id], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        res.json({ success: true, count: result.rows?.length || 0, data: result.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al obtener wishlist del cliente' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.obtenerWishlistCliente = obtenerWishlistCliente;
//# sourceMappingURL=clientesController.js.map