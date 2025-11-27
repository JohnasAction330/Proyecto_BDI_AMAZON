"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vaciarCarrito = exports.eliminarItemCarrito = exports.actualizarCantidadItem = exports.agregarItemCarrito = exports.obtenerCarritoCliente = void 0;
const database_1 = __importDefault(require("../config/database"));
const obtenerCarritoCliente = async (req, res) => {
    const { idCliente } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        let result = await connection.execute(`SELECT ID_CARRITO, FECHA_CREACION
         FROM TBL_CARRITO
        WHERE ID_CLIENTE = :idCliente
        ORDER BY FECHA_CREACION DESC`, [idCliente], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        let carritoId;
        if (result.rows && result.rows.length > 0) {
            carritoId = result.rows[0].ID_CARRITO;
        }
        else {
            const insert = await connection.execute(`INSERT INTO TBL_CARRITO (ID_CARRITO, FECHA_CREACION, ID_CLIENTE)
         VALUES (SEQ_CARRITO.NEXTVAL, SYSDATE, :idCliente)
         RETURNING ID_CARRITO INTO :id`, {
                idCliente,
                id: { dir: database_1.default.BIND_OUT, type: database_1.default.NUMBER }
            }, { autoCommit: true });
            carritoId = insert.outBinds?.id[0];
        }
        const items = await connection.execute(`SELECT 
         ci.ID_SKU,
         ci.CANTIDAD,
         ci.FECHA_AGREGADO,
         s.PRECIO,
         s.STOCK,
         p.ID_PRODUCTO,
         p.NOMBRE,
         p.MARCA
       FROM TBL_CARRITO_ITEM ci
       JOIN TBL_SKU s ON ci.ID_SKU = s.ID_SKU
       JOIN TBL_PRODUCTO p ON s.ID_PRODUCTO = p.ID_PRODUCTO
      WHERE ci.ID_CARRITO = :idCarrito`, [carritoId], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        res.json({
            success: true,
            data: {
                id_carrito: carritoId,
                items: items.rows || []
            }
        });
    }
    catch (error) {
        console.error('Error al obtener carrito:', error);
        res.status(500).json({ success: false, message: 'Error al obtener carrito' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.obtenerCarritoCliente = obtenerCarritoCliente;
const agregarItemCarrito = async (req, res) => {
    const { idCliente } = req.params;
    const { id_sku, cantidad } = req.body;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const carritoRes = await connection.execute(`SELECT ID_CARRITO
         FROM TBL_CARRITO
        WHERE ID_CLIENTE = :idCliente
        ORDER BY FECHA_CREACION DESC`, [idCliente], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        let carritoId;
        if (carritoRes.rows && carritoRes.rows.length > 0) {
            carritoId = carritoRes.rows[0].ID_CARRITO;
        }
        else {
            const insert = await connection.execute(`INSERT INTO TBL_CARRITO (ID_CARRITO, FECHA_CREACION, ID_CLIENTE)
         VALUES (SEQ_CARRITO.NEXTVAL, SYSDATE, :idCliente)
         RETURNING ID_CARRITO INTO :id`, {
                idCliente,
                id: { dir: database_1.default.BIND_OUT, type: database_1.default.NUMBER }
            }, { autoCommit: true });
            carritoId = insert.outBinds?.id[0];
        }
        const existeRes = await connection.execute(`SELECT CANTIDAD
         FROM TBL_CARRITO_ITEM
        WHERE ID_CARRITO = :idCarrito AND ID_SKU = :idSku`, { idCarrito: carritoId, idSku: id_sku }, { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        if (existeRes.rows && existeRes.rows.length > 0) {
            await connection.execute(`UPDATE TBL_CARRITO_ITEM
            SET CANTIDAD = CANTIDAD + :cantidad,
                FECHA_AGREGADO = SYSDATE
          WHERE ID_CARRITO = :idCarrito AND ID_SKU = :idSku`, { cantidad, idCarrito: carritoId, idSku: id_sku }, { autoCommit: true });
        }
        else {
            await connection.execute(`INSERT INTO TBL_CARRITO_ITEM (ID_SKU, ID_CARRITO, CANTIDAD, FECHA_AGREGADO)
         VALUES (:idSku, :idCarrito, :cantidad, SYSDATE)`, { idSku: id_sku, idCarrito: carritoId, cantidad }, { autoCommit: true });
        }
        res.status(201).json({
            success: true,
            message: 'Item agregado/actualizado en el carrito',
            data: { id_carrito: carritoId }
        });
    }
    catch (error) {
        console.error('Error al agregar item al carrito:', error);
        res.status(500).json({ success: false, message: 'Error al agregar item al carrito' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.agregarItemCarrito = agregarItemCarrito;
const actualizarCantidadItem = async (req, res) => {
    const { idCliente, idSku } = req.params;
    const { cantidad } = req.body;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const carritoRes = await connection.execute(`SELECT ID_CARRITO
         FROM TBL_CARRITO
        WHERE ID_CLIENTE = :idCliente
        ORDER BY FECHA_CREACION DESC`, [idCliente], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        if (!carritoRes.rows || carritoRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
        }
        const carritoId = carritoRes.rows[0].ID_CARRITO;
        const result = await connection.execute(`UPDATE TBL_CARRITO_ITEM
          SET CANTIDAD = :cantidad
        WHERE ID_CARRITO = :idCarrito AND ID_SKU = :idSku`, { cantidad, idCarrito: carritoId, idSku }, { autoCommit: true });
        if (result.rowsAffected && result.rowsAffected > 0) {
            res.json({ success: true, message: 'Cantidad actualizada' });
        }
        else {
            res.status(404).json({ success: false, message: 'Item no encontrado en el carrito' });
        }
    }
    catch (error) {
        console.error('Error al actualizar cantidad:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar cantidad' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.actualizarCantidadItem = actualizarCantidadItem;
const eliminarItemCarrito = async (req, res) => {
    const { idCliente, idSku } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const carritoRes = await connection.execute(`SELECT ID_CARRITO
         FROM TBL_CARRITO
        WHERE ID_CLIENTE = :idCliente
        ORDER BY FECHA_CREACION DESC`, [idCliente], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        if (!carritoRes.rows || carritoRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
        }
        const carritoId = carritoRes.rows[0].ID_CARRITO;
        const result = await connection.execute(`DELETE FROM TBL_CARRITO_ITEM
        WHERE ID_CARRITO = :idCarrito AND ID_SKU = :idSku`, { idCarrito: carritoId, idSku }, { autoCommit: true });
        if (result.rowsAffected && result.rowsAffected > 0) {
            res.json({ success: true, message: 'Item eliminado del carrito' });
        }
        else {
            res.status(404).json({ success: false, message: 'Item no encontrado en el carrito' });
        }
    }
    catch (error) {
        console.error('Error al eliminar item del carrito:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar item del carrito' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.eliminarItemCarrito = eliminarItemCarrito;
const vaciarCarrito = async (req, res) => {
    const { idCliente } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const carritoRes = await connection.execute(`SELECT ID_CARRITO
         FROM TBL_CARRITO
        WHERE ID_CLIENTE = :idCliente
        ORDER BY FECHA_CREACION DESC`, [idCliente], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        if (!carritoRes.rows || carritoRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
        }
        const carritoId = carritoRes.rows[0].ID_CARRITO;
        await connection.execute(`DELETE FROM TBL_CARRITO_ITEM WHERE ID_CARRITO = :idCarrito`, [carritoId], { autoCommit: true });
        res.json({ success: true, message: 'Carrito vaciado' });
    }
    catch (error) {
        console.error('Error al vaciar carrito:', error);
        res.status(500).json({ success: false, message: 'Error al vaciar carrito' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.vaciarCarrito = vaciarCarrito;
//# sourceMappingURL=carritoController.js.map