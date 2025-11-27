"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizarEstadoEnvio = exports.obtenerEnvioPorId = exports.obtenerEnvioPorPedido = exports.crearEnvio = void 0;
const database_1 = __importDefault(require("../config/database"));
// POST /api/envios
// body: { "id_pedido": 1, "id_direccion": 3, "empresa_envio": "DHL", "numero_rastreo": "DHL123" }
const crearEnvio = async (req, res) => {
    const { id_pedido, id_direccion, empresa_envio, numero_rastreo } = req.body;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`INSERT INTO TBL_ENVIO
         (ID_ENVIO, EMPRESA_ENVIO, NUMERO_RASTREO, FECHA_ENVIO, FECHA_ENTREGA_ESTIMADA, ESTADO_ENVIO, ID_PEDIDO, ID_DIRECCION)
       VALUES (SEQ_ENVIO.NEXTVAL, :empresa, :rastreo, SYSDATE, SYSDATE + 5, 'En tránsito', :idPedido, :idDireccion)
       RETURNING ID_ENVIO INTO :id`, {
            empresa: empresa_envio,
            rastreo: numero_rastreo,
            idPedido: id_pedido,
            idDireccion: id_direccion,
            id: { dir: database_1.default.BIND_OUT, type: database_1.default.NUMBER }
        }, { autoCommit: true });
        res.status(201).json({
            success: true,
            message: 'Envío creado exitosamente',
            data: { id_envio: result.outBinds?.id[0] }
        });
    }
    catch (error) {
        console.error('Error al crear envío:', error);
        res.status(500).json({ success: false, message: 'Error al crear envío' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.crearEnvio = crearEnvio;
// GET /api/envios/pedido/:idPedido
const obtenerEnvioPorPedido = async (req, res) => {
    const { idPedido } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT 
         ID_ENVIO,
         EMPRESA_ENVIO,
         NUMERO_RASTREO,
         FECHA_ENVIO,
         FECHA_ENTREGA_ESTIMADA,
         FECHA_ENTREGA_REAL,
         ESTADO_ENVIO,
         ID_PEDIDO,
         ID_DIRECCION
       FROM TBL_ENVIO
      WHERE ID_PEDIDO = :idPedido
      ORDER BY FECHA_ENVIO DESC`, [idPedido], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        res.json({
            success: true,
            count: result.rows?.length || 0,
            data: result.rows
        });
    }
    catch (error) {
        console.error('Error al obtener envíos por pedido:', error);
        res.status(500).json({ success: false, message: 'Error al obtener envíos por pedido' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.obtenerEnvioPorPedido = obtenerEnvioPorPedido;
// GET /api/envios/:idEnvio
const obtenerEnvioPorId = async (req, res) => {
    const { idEnvio } = req.params;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`SELECT 
         ID_ENVIO,
         EMPRESA_ENVIO,
         NUMERO_RASTREO,
         FECHA_ENVIO,
         FECHA_ENTREGA_ESTIMADA,
         FECHA_ENTREGA_REAL,
         ESTADO_ENVIO,
         ID_PEDIDO,
         ID_DIRECCION
       FROM TBL_ENVIO
      WHERE ID_ENVIO = :idEnvio`, [idEnvio], { outFormat: database_1.default.OUT_FORMAT_OBJECT });
        if (result.rows && result.rows.length > 0) {
            res.json({ success: true, data: result.rows[0] });
        }
        else {
            res.status(404).json({ success: false, message: 'Envío no encontrado' });
        }
    }
    catch (error) {
        console.error('Error al obtener envío:', error);
        res.status(500).json({ success: false, message: 'Error al obtener envío' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.obtenerEnvioPorId = obtenerEnvioPorId;
const actualizarEstadoEnvio = async (req, res) => {
    const { idEnvio } = req.params;
    const { estado, fecha_entrega_real } = req.body;
    let connection;
    try {
        connection = await database_1.default.getConnection();
        const result = await connection.execute(`UPDATE TBL_ENVIO
          SET ESTADO_ENVIO = :estado,
              FECHA_ENTREGA_REAL = CASE 
                                     WHEN :fechaReal IS NOT NULL 
                                     THEN TO_DATE(:fechaReal, 'YYYY-MM-DD HH24:MI')
                                     ELSE FECHA_ENTREGA_REAL
                                   END
        WHERE ID_ENVIO = :idEnvio`, {
            estado,
            fechaReal: fecha_entrega_real || null,
            idEnvio
        }, { autoCommit: true });
        if (result.rowsAffected && result.rowsAffected > 0) {
            res.json({ success: true, message: 'Estado de envío actualizado' });
        }
        else {
            res.status(404).json({ success: false, message: 'Envío no encontrado' });
        }
    }
    catch (error) {
        console.error('Error al actualizar estado de envío:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar estado de envío' });
    }
    finally {
        if (connection)
            await connection.close();
    }
};
exports.actualizarEstadoEnvio = actualizarEstadoEnvio;
//# sourceMappingURL=enviosController.js.map