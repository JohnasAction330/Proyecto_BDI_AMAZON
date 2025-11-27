import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  connectString: process.env.DB_CONNECT_STRING!
};

export async function initialize() {
  try {
    await oracledb.createPool(dbConfig);
    console.log('Conexión a Oracle establecida');
  } catch (err) {
    console.error('Error al conectar con Oracle:', err);
    process.exit(1);
  }
}

export async function close() {
  await oracledb.getPool().close(0);
}

export default oracledb;
