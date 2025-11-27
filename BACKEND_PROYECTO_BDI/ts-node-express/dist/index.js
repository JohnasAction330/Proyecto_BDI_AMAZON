"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const productoRoutes_1 = __importDefault(require("./routes/productoRoutes"));
const usuarioRoutes_1 = __importDefault(require("./routes/usuarioRoutes"));
const clientesRoutes_1 = __importDefault(require("./routes/clientesRoutes"));
const carritoRoutes_1 = __importDefault(require("./routes/carritoRoutes"));
const pedidoRoutes_1 = __importDefault(require("./routes/pedidoRoutes"));
const pagosRoutes_1 = __importDefault(require("./routes/pagosRoutes"));
const envioRoutes_1 = __importDefault(require("./routes/envioRoutes"));
const categoriaRoutes_1 = __importDefault(require("./routes/categoriaRoutes"));
const skuRoutes_1 = __importDefault(require("./routes/skuRoutes"));
const vendedoresRoutes_1 = __importDefault(require("./routes/vendedoresRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.json({ message: 'API Marketplace Amazon - Funcionando' });
});
app.use('/api/productos', productoRoutes_1.default);
app.use('/api/usuarios', usuarioRoutes_1.default);
app.use('/api/clientes', clientesRoutes_1.default);
app.use('/api/carrito', carritoRoutes_1.default);
app.use('/api/pedidos/', pedidoRoutes_1.default);
app.use('/api/pagos', pagosRoutes_1.default);
app.use('/api/envios', envioRoutes_1.default);
app.use('/api/categorias', categoriaRoutes_1.default);
app.use('/api/sku', skuRoutes_1.default);
app.use('/api/vendedores', vendedoresRoutes_1.default);
async function startServer() {
    try {
        await (0, database_1.initialize)();
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
}
process.on('SIGINT', async () => {
    await (0, database_1.close)();
    process.exit(0);
});
startServer();
//# sourceMappingURL=index.js.map