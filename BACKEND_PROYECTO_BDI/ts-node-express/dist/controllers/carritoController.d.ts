import { Request, Response } from 'express';
export declare const obtenerCarritoCliente: (req: Request, res: Response) => Promise<void>;
export declare const agregarItemCarrito: (req: Request, res: Response) => Promise<void>;
export declare const actualizarCantidadItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const eliminarItemCarrito: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const vaciarCarrito: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=carritoController.d.ts.map