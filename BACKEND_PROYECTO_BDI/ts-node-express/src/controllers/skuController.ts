import { Request, Response } from 'express';
import oracledb from '../config/database';

export const obtenerSkusPorProducto = async (req: Request, res: Response) => {
  const { idProducto } = req.params;
  let connection: any;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT ID_SKU, PRECIO, STOCK, ID_PRODUCTO
         FROM TBL_SKU
        WHERE ID_PRODUCTO = :idProducto
        ORDER BY ID_SKU`,
      [idProducto],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ success: true, count: result.rows?.length || 0, data: result.rows });
  } catch (error) {
    console.error('Error al obtener SKUs:', error);
    res.status(500).json({ success: false, message: 'Error al obtener SKUs' });
  } finally {
    if (connection) await connection.close();
  }
};

export const crearSku = async (req: Request, res: Response) => {
  const { id_producto, precio, stock } = req.body;
  let connection: any;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `INSERT INTO TBL_SKU (ID_SKU, PRECIO, STOCK, ID_PRODUCTO)
       VALUES (SEQ_SKU.NEXTVAL, :precio, :stock, :idProducto)
       RETURNING ID_SKU INTO :id`,
      {
        precio,
        stock,
        idProducto: id_producto,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );
    res.status(201).json({
      success: true,
      message: 'SKU creado',
      data: { id_sku: result.outBinds?.id[0] }
    });
  } catch (error) {
    console.error('Error al crear SKU:', error);
    res.status(500).json({ success: false, message: 'Error al crear SKU' });
  } finally {
    if (connection) await connection.close();
  }
};

export const actualizarSku = async (req: Request, res: Response) => {
  const { idSku } = req.params;
  const { precio, stock } = req.body;
  let connection: any;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `UPDATE TBL_SKU
          SET PRECIO = :precio,
              STOCK  = :stock
        WHERE ID_SKU = :idSku`,
      { precio, stock, idSku },
      { autoCommit: true }
    );
    if (result.rowsAffected && result.rowsAffected > 0) {
      res.json({ success: true, message: 'SKU actualizado' });
    } else {
      res.status(404).json({ success: false, message: 'SKU no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar SKU:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar SKU' });
  } finally {
    if (connection) await connection.close();
  }
};

export const eliminarSku = async (req: Request, res: Response) => {
  const { idSku } = req.params;
  let connection: any;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `DELETE FROM TBL_SKU_PRODUCTO WHERE ID_SKU = :idSku`,
      [idSku],
      { autoCommit: false }
    );
    await connection.execute(
      `DELETE FROM TBL_CARRITO_ITEM WHERE ID_SKU = :idSku`,
      [idSku],
      { autoCommit: false }
    );
    await connection.execute(
      `DELETE FROM TBL_PEDIDO_ITEM WHERE ID_SKU = :idSku`,
      [idSku],
      { autoCommit: false }
    );

    const result = await connection.execute(
      `DELETE FROM TBL_SKU WHERE ID_SKU = :idSku`,
      [idSku],
      { autoCommit: false }
    );

    await connection.commit();

    if (result.rowsAffected && result.rowsAffected > 0) {
      res.json({ success: true, message: 'SKU eliminado' });
    } else {
      res.status(404).json({ success: false, message: 'SKU no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar SKU:', error);
    if (connection) await connection.rollback();
    res.status(500).json({ success: false, message: 'Error al eliminar SKU' });
  } finally {
    if (connection) await connection.close();
  }
};


export const obtenerAtributosDeSku = async (req: Request, res: Response) => {
  const { idSku } = req.params;
  let connection: any;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT 
         a.ID_ATRIBUTO,
         a.NOMBRE,
         a.VALOR
       FROM TBL_ATRIBUTO a
       JOIN TBL_SKU_PRODUCTO sp
         ON a.ID_ATRIBUTO = sp.ID_ATRIBUTO
      WHERE sp.ID_SKU = :idSku`,
      [idSku],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ success: true, count: result.rows?.length || 0, data: result.rows });
  } catch (error) {
    console.error('Error al obtener atributos de SKU:', error);
    res.status(500).json({ success: false, message: 'Error al obtener atributos de SKU' });
  } finally {
    if (connection) await connection.close();
  }
};


export const asignarAtributoASku = async (req: Request, res: Response) => {
  const { idSku } = req.params;
  const { id_atributo } = req.body;
  let connection: any;
  try {
    connection = await oracledb.getConnection();
    await connection.execute(
      `INSERT INTO TBL_SKU_PRODUCTO (ID_SKU, ID_ATRIBUTO)
       VALUES (:idSku, :idAtributo)`,
      { idSku, idAtributo: id_atributo },
      { autoCommit: true }
    );
    res.status(201).json({ success: true, message: 'Atributo asignado al SKU' });
  } catch (error: any) {
    console.error('Error al asignar atributo a SKU:', error);
    if (error.errorNum === 1) {
      res.status(400).json({ success: false, message: 'El atributo ya está asignado a este SKU' });
    } else {
      res.status(500).json({ success: false, message: 'Error al asignar atributo a SKU' });
    }
  } finally {
    if (connection) await connection.close();
  }
};
