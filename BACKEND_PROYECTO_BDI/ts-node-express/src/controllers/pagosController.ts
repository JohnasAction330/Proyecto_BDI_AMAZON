import { Request, Response } from 'express';
import oracledb from '../config/database';

export const crearPago = async (req: Request, res: Response) => {
  const { id_pedido, metodo_pago, monto, referencia_transaccion } = req.body;
  let connection: any;

  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `INSERT INTO TBL_PAGO
         (ID_PAGO, METODO_PAGO, MONTO, ESTADO_PAGO, FECHA_PAGO, REFERENCIA_TRANSACCION, ID_PEDIDO)
       VALUES (SEQ_PAGO.NEXTVAL, :metodo, :monto, 'Aprobado', SYSDATE, :ref, :idPedido)
       RETURNING ID_PAGO INTO :id`,
      {
        metodo: metodo_pago,
        monto,
        ref: referencia_transaccion,
        idPedido: id_pedido,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    res.status(201).json({
      success: true,
      message: 'Pago registrado exitosamente',
      data: { id_pago: result.outBinds?.id[0] }
    });

  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json({ success: false, message: 'Error al crear pago' });
  } finally {
    if (connection) await connection.close();
  }
};

export const obtenerPagoPorPedido = async (req: Request, res: Response) => {
  const { idPedido } = req.params;
  let connection: any;

  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT 
         ID_PAGO,
         METODO_PAGO,
         MONTO,
         ESTADO_PAGO,
         FECHA_PAGO,
         REFERENCIA_TRANSACCION,
         ID_PEDIDO
       FROM TBL_PAGO
      WHERE ID_PEDIDO = :idPedido
      ORDER BY FECHA_PAGO DESC`,
      [idPedido],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      success: true,
      count: result.rows?.length || 0,
      data: result.rows
    });

  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener pagos' });
  } finally {
    if (connection) await connection.close();
  }
};

export const obtenerPagoPorId = async (req: Request, res: Response) => {
  const { idPago } = req.params;
  let connection: any;

  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT 
         ID_PAGO,
         METODO_PAGO,
         MONTO,
         ESTADO_PAGO,
         FECHA_PAGO,
         REFERENCIA_TRANSACCION,
         ID_PEDIDO
       FROM TBL_PAGO
      WHERE ID_PAGO = :idPago`,
      [idPago],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows && result.rows.length > 0) {
      res.json({ success: true, data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Pago no encontrado' });
    }

  } catch (error) {
    console.error('Error al obtener pago:', error);
    res.status(500).json({ success: false, message: 'Error al obtener pago' });
  } finally {
    if (connection) await connection.close();
  }
};

export const actualizarEstadoPago = async (req: Request, res: Response) => {
  const { idPago } = req.params;
  const { estado } = req.body;
  let connection: any;

  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `UPDATE TBL_PAGO
          SET ESTADO_PAGO = :estado
        WHERE ID_PAGO = :idPago`,
      { estado, idPago },
      { autoCommit: true }
    );

    if (result.rowsAffected && result.rowsAffected > 0) {
      res.json({ success: true, message: 'Estado de pago actualizado' });
    } else {
      res.status(404).json({ success: false, message: 'Pago no encontrado' });
    }

  } catch (error) {
    console.error('Error al actualizar estado de pago:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar estado de pago' });
  } finally {
    if (connection) await connection.close();
  }
};
