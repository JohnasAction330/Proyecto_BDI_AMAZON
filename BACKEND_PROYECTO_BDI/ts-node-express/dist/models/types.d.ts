export interface Cliente {
    ID_CLIENTE: number;
    ID_USUARIO: number;
    ID_ESTADO: number;
}
export interface Usuario {
    ID_USUARIO: number;
    NOMBRE: string;
    APELLIDO: string;
    CORREO: string;
    FECHA_REGISTRO: Date;
    FECHA_NACIMIENTO: Date;
}
export interface Producto {
    ID_PRODUCTO: number;
    NOMBRE: string;
    MARCA: string;
}
export interface SKU {
    ID_SKU: number;
    PRECIO: number;
    STOCK: number;
    ID_PRODUCTO: number;
}
export interface Pedido {
    ID_PEDIDO: number;
    FECHA_PEDIDO: Date;
    ESTADO: string;
    TOTAL: number;
    SUBTOTAL: number;
    IMPUESTOS: number;
    ID_CLIENTE: number;
    ID_DIRECCION: number;
}
//# sourceMappingURL=types.d.ts.map