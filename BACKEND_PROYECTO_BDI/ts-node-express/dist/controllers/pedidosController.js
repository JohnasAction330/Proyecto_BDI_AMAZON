"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizarEstadoPedido = exports.obtenerDetallePedido = exports.obtenerPedidosDeCliente = exports.crearPedidoDesdeCarrito = void 0;
const database_1 = __importDefault(require("../config/database"));
const crearPedidoDesdeCarrito = async (req, res) => {
    const { idCliente } = req.params;
    const { id_direccion, id_vendedor_default } = req.body;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const carritoRes = await connection.execute(`SELECT ID_CARRITO
         FROM TBL_CARRITO
        WHERE ID_CLIENTE = :idCliente
        ORDER BY FECHA_CREACION DESC`, [idCliente], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        if (!carritoRes.rows || carritoRes.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'El cliente no tiene carrito' });
        }
        const idCarrito = carritoRes.rows[0].ID_CARRITO;
        const itemsRes = await connection.execute(`SELECT 
         ci.ID_SKU,
         ci.CANTIDAD,
         s.PRECIO
       FROM TBL_CARRITO_ITEM ci
       JOIN TBL_SKU s ON ci.ID_SKU = s.ID_SKU
      WHERE ci.ID_CARRITO = :idCarrito`, [idCarrito], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        const items = (itemsRes.rows || []);
        if (items.length === 0) {
            return res.status(400).json({ success: false, message: 'El carrito está vacío' });
        }
        let subtotal = 0;
        items.forEach(i => {
            subtotal += i.PRECIO * i.CANTIDAD;
        });
        const impuestos = subtotal * 0.15;
        const total = subtotal + impuestos;
        const pedidoRes = await connection.execute(`INSERT INTO TBL_PEDIDO 
         (ID_PEDIDO, FECHA_PEDIDO, ESTADO, TOTAL, SUBTOTAL, IMPUESTOS, ID_CLIENTE, ID_DIRECCION)
       VALUES (SEQ_PEDIDO.NEXTVAL, SYSDATE, 'Procesando', :total, :subtotal, :impuestos, :idCliente, :idDireccion)
       RETURNING ID_PEDIDO INTO :id`, {
            total,
            subtotal,
            impuestos,
            idCliente,
            idDireccion: id_direccion,
            id: { dir: database_1.default.BIND_OUT, type: database_1.default.NUMBER }
        }, { autoCommit: false });
        const idPedido = pedidoRes.outBinds?.id[0];
        for (const item of items) {
            await connection.execute(`INSERT INTO TBL_PEDIDO_ITEM 
           (ID_PEDIDO_ITEM, ID_PEDIDO, ID_VENDEDOR, ID_SKU, CANTIDAD)
         VALUES (SEQ_PEDIDO_ITEM.NEXTVAL, :idPedido, :idVendedor, :idSku, :cantidad)`, {
                idPedido,
                idVendedor: id_vendedor_default,
                idSku: item.ID_SKU,
                cantidad: item.CANTIDAD
            }, { autoCommit: false });
        }
        await connection.execute(`DELETE FROM TBL_CARRITO_ITEM WHERE ID_CARRITO = :idCarrito`, [idCarrito], { autoCommit: false });
        await connection.commit();
        res.status(201).json({
            success: true,
            message: 'Pedido creado exitosamente',
            data: {
                id_pedido: idPedido,
                subtotal,
                impuestos,
                total
            }
        });
    }
    catch (error) {
        console.error('Error al crear pedido desde carrito:', error);
        if (connection)
            await connection.rollback();
        res.status(500).json({ success: false, message: 'Error al crear pedido' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.crearPedidoDesdeCarrito = crearPedidoDesdeCarrito;
const obtenerPedidosDeCliente = async (req, res) => {
    const { idCliente } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT 
         ID_PEDIDO,
         FECHA_PEDIDO,
         ESTADO,
         TOTAL,
         SUBTOTAL,
         IMPUESTOS,
         ID_DIRECCION
       FROM TBL_PEDIDO
      WHERE ID_CLIENTE = :idCliente
      ORDER BY FECHA_PEDIDO DESC`, [idCliente], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        res.json({
            success: true,
            count: result.rows?.length || 0,
            data: result.rows
        });
    }
    catch (error) {
        console.error('Error al obtener pedidos de cliente:', error);
        res.status(500).json({ success: false, message: 'Error al obtener pedidos de cliente' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.obtenerPedidosDeCliente = obtenerPedidosDeCliente;
const obtenerDetallePedido = async (req, res) => {
    const { idPedido } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const pedidoRes = await connection.execute(`SELECT 
         p.ID_PEDIDO,
         p.FECHA_PEDIDO,
         p.ESTADO,
         p.TOTAL,
         p.SUBTOTAL,
         p.IMPUESTOS,
         p.ID_CLIENTE,
         p.ID_DIRECCION
       FROM TBL_PEDIDO p
      WHERE p.ID_PEDIDO = :idPedido`, [idPedido], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        if (!pedidoRes.rows || pedidoRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        }
        const itemsRes = await connection.execute(`SELECT 
         pi.ID_PEDIDO_ITEM,
         pi.CANTIDAD,
         s.ID_SKU,
         s.PRECIO,
         prod.ID_PRODUCTO,
         prod.NOMBRE,
         prod.MARCA
       FROM TBL_PEDIDO_ITEM pi
       JOIN TBL_SKU s ON pi.ID_SKU = s.ID_SKU
       JOIN TBL_PRODUCTO prod ON s.ID_PRODUCTO = prod.ID_PRODUCTO
      WHERE pi.ID_PEDIDO = :idPedido`, [idPedido], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        res.json({
            success: true,
            data: {
                pedido: pedidoRes.rows[0],
                items: itemsRes.rows || []
            }
        });
    }
    catch (error) {
        console.error('Error al obtener detalle de pedido:', error);
        res.status(500).json({ success: false, message: 'Error al obtener detalle de pedido' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.obtenerDetallePedido = obtenerDetallePedido;
const actualizarEstadoPedido = async (req, res) => {
    const { idPedido } = req.params;
    const { estado } = req.body;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`UPDATE TBL_PEDIDO
          SET ESTADO = :estado
        WHERE ID_PEDIDO = :idPedido`, { estado, idPedido }, { autoCommit: true });
        if (result.rowsAffected && result.rowsAffected > 0) {
            res.json({ success: true, message: 'Estado de pedido actualizado' });
        }
        else {
            res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        }
    }
    catch (error) {
        console.error('Error al actualizar estado de pedido:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar estado de pedido' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.actualizarEstadoPedido = actualizarEstadoPedido;
//# sourceMappingURL=pedidosController.js.map