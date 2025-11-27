import { Request, Response } from 'express';
import oracledb from '../config/database';



export const obtenerUsuarios = async (req: Request, res: Response) => {
  let connection: any;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT ID_USUARIO, NOMBRE, APELLIDO, CORREO, FECHA_REGISTRO, FECHA_NACIMIENTO
       FROM TBL_USUARIOS ORDER BY ID_USUARIO`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ success: true, count: result.rows?.length || 0, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
  } finally {
    if (connection) await connection.close();
  }
};


export const obtenerUsuarioPorId = async (req: Request, res: Response) => {
  const { id } = req.params;
  let connection: any;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT ID_USUARIO, NOMBRE, APELLIDO, CORREO, FECHA_REGISTRO, FECHA_NACIMIENTO
       FROM TBL_USUARIOS WHERE ID_USUARIO = :id`,
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (result.rows && result.rows.length > 0) {
      res.json({ success: true, data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener usuario' });
  } finally {
    if (connection) await connection.close();
  }
};


export const crearUsuario = async (req: Request, res: Response) => {
  const { nombre, apellido, correo, fecha_nacimiento } = req.body;
  let connection: any;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `INSERT INTO TBL_USUARIOS (ID_USUARIO, NOMBRE, APELLIDO, CORREO, FECHA_REGISTRO, FECHA_NACIMIENTO)
       VALUES (SEQ_USUARIO.NEXTVAL, :nombre, :apellido, :correo, SYSDATE, TO_DATE(:fecha_nacimiento, 'YYYY-MM-DD'))
       RETURNING ID_USUARIO INTO :id`,
      {
        nombre,
        apellido,
        correo,
        fecha_nacimiento,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: { id: result.outBinds?.id }
    });
  } catch (error: any) {
    if (error.errorNum === 1) {
      res.status(400).json({ success: false, message: 'Correo ya está registrado.' });
    } else {
      res.status(500).json({ success: false, message: 'Error al crear usuario' });
    }
  } finally {
    if (connection) await connection.close();
  }
};


export const actualizarUsuario = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, apellido, correo, fecha_nacimiento } = req.body;
  let connection: any;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `UPDATE TBL_USUARIOS 
         SET NOMBRE = :nombre, APELLIDO = :apellido, CORREO = :correo, FECHA_NACIMIENTO = TO_DATE(:fecha_nacimiento, 'YYYY-MM-DD')
       WHERE ID_USUARIO = :id`,
      { nombre, apellido, correo, fecha_nacimiento, id },
      { autoCommit: true }
    );
    if (result.rowsAffected && result.rowsAffected > 0) {
      res.json({ success: true, message: 'Usuario actualizado' });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
  } finally {
    if (connection) await connection.close();
  }
};


export const eliminarUsuario = async (req: Request, res: Response) => {
  const { id } = req.params; 
  let connection: any;

  try {
    connection = await oracledb.getConnection();

  
    const clienteRes = await connection.execute(
      `SELECT ID_CLIENTE 
         FROM TBL_CLIENTE 
        WHERE ID_USUARIO = :idUsuario`,
      { idUsuario: id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    let idCliente: number | null = null;
    if (clienteRes.rows && clienteRes.rows.length > 0) {
      idCliente = (clienteRes.rows[0] as any).ID_CLIENTE;
    }

    if (idCliente !== null) {
  
      await connection.execute(
        `DELETE FROM TBL_RESENA 
          WHERE ID_CLIENTE = :idCliente`,
        { idCliente }
      );

      await connection.execute(
        `DELETE FROM TBL_WISH_LIST 
          WHERE ID_CLIENTE = :idCliente`,
        { idCliente }
      );

      await connection.execute(
        `DELETE FROM TBL_CARRITO_ITEM
          WHERE ID_CARRITO IN (
            SELECT ID_CARRITO FROM TBL_CARRITO WHERE ID_CLIENTE = :idCliente
          )`,
        { idCliente }
      );

      await connection.execute(
        `DELETE FROM TBL_CARRITO 
          WHERE ID_CLIENTE = :idCliente`,
        { idCliente }
      );

 
      await connection.execute(
        `DELETE FROM TBL_PAGO
          WHERE ID_PEDIDO IN (
            SELECT ID_PEDIDO
              FROM TBL_PEDIDO
             WHERE ID_DIRECCION IN (
               SELECT ID_DIRECCION FROM TBL_DIRECCION WHERE ID_CLIENTE = :idCliente
             )
          )`,
        { idCliente }
      );

      await connection.execute(
        `DELETE FROM TBL_ENVIO
          WHERE ID_PEDIDO IN (
            SELECT ID_PEDIDO
              FROM TBL_PEDIDO
             WHERE ID_DIRECCION IN (
               SELECT ID_DIRECCION FROM TBL_DIRECCION WHERE ID_CLIENTE = :idCliente
             )
          )`,
        { idCliente }
      );

      await connection.execute(
        `DELETE FROM TBL_PEDIDO_ITEM
          WHERE ID_PEDIDO IN (
            SELECT ID_PEDIDO
              FROM TBL_PEDIDO
             WHERE ID_DIRECCION IN (
               SELECT ID_DIRECCION FROM TBL_DIRECCION WHERE ID_CLIENTE = :idCliente
             )
          )`,
        { idCliente }
      );

      await connection.execute(
        `DELETE FROM TBL_PEDIDO
          WHERE ID_DIRECCION IN (
            SELECT ID_DIRECCION FROM TBL_DIRECCION WHERE ID_CLIENTE = :idCliente
          )`,
        { idCliente }
      );

      await connection.execute(
        `DELETE FROM TBL_PAGO
          WHERE ID_PEDIDO IN (
            SELECT ID_PEDIDO FROM TBL_PEDIDO WHERE ID_CLIENTE = :idCliente
          )`,
        { idCliente }
      );

      await connection.execute(
        `DELETE FROM TBL_ENVIO
          WHERE ID_PEDIDO IN (
            SELECT ID_PEDIDO FROM TBL_PEDIDO WHERE ID_CLIENTE = :idCliente
          )`,
        { idCliente }
      );

      await connection.execute(
        `DELETE FROM TBL_PEDIDO_ITEM
          WHERE ID_PEDIDO IN (
            SELECT ID_PEDIDO FROM TBL_PEDIDO WHERE ID_CLIENTE = :idCliente
          )`,
        { idCliente }
      );

      await connection.execute(
        `DELETE FROM TBL_PEDIDO 
          WHERE ID_CLIENTE = :idCliente`,
        { idCliente }
      );
      await connection.execute(
        `DELETE FROM TBL_DIRECCION
          WHERE ID_CLIENTE = :idCliente`,
        { idCliente }
      );

      await connection.execute(
        `DELETE FROM TBL_CLIENTE 
          WHERE ID_CLIENTE = :idCliente`,
        { idCliente }
      );
    }

    await connection.execute(
      `DELETE FROM TBL_VENDEDORES 
        WHERE ID_USUARIO = :idUsuario`,
      { idUsuario: id }
    );


    const result = await connection.execute(
      `DELETE FROM TBL_USUARIOS 
        WHERE ID_USUARIO = :id`,
      { id }
    );

    await connection.commit();

    if (result.rowsAffected && result.rowsAffected > 0) {
      res.json({
        success: true,
        message: 'Usuario y todos sus registros relacionados fueron eliminados'
      });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

  } catch (error: any) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error al eliminar usuario:', error);

    if (error.errorNum === 2292) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el usuario porque aún tiene registros relacionados en otras tablas.'
      });
    }

    res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};


