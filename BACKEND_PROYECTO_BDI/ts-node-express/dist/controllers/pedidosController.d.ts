import { Request, Response } from 'express';
export declare const crearPedidoDesdeCarrito: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const obtenerPedidosDeCliente: (req: Request, res: Response) => Promise<void>;
export declare const obtenerDetallePedido: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const actualizarEstadoPedido: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=pedidosController.d.ts.map