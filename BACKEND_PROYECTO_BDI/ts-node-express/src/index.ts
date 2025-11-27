import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initialize, close } from './config/database';
import productoRoutes from './routes/productoRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import clienteRoutes from './routes/clientesRoutes';
import carritoRoutes from './routes/carritoRoutes';
import pedidoRoutes from './routes/pedidoRoutes';
import pagoRoutes from './routes/pagosRoutes';
import envioRoutes from './routes/envioRoutes';
import categoriaRoutes from './routes/categoriaRoutes';
import skuRoutes from './routes/skuRoutes';
import vendedoresRoutes from './routes/vendedoresRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API Marketplace Amazon - Funcionando' });
});

app.use('/api/productos', productoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/pedidos/', pedidoRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/envios', envioRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/sku', skuRoutes);
app.use('/api/vendedores', vendedoresRoutes);

async function startServer() {
  try {
    await initialize();
    
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await close();
  process.exit(0);
});

startServer();
