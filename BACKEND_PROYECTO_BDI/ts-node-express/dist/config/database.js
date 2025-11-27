"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = initialize;
exports.close = close;
const oracledb_1 = __importDefault(require("oracledb"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING
};
async function initialize() {
    try {
        await oracledb_1.default.createPool(dbConfig);
        console.log('Conexión a Oracle establecida');
    }
    catch (err) {
        console.error('Error al conectar con Oracle:', err);
        process.exit(1);
    }
}
async function close() {
    await oracledb_1.default.getPool().close(0);
}
exports.default = oracledb_1.default;
//# sourceMappingURL=database.js.map