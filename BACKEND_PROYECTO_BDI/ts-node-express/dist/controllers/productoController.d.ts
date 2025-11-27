import { Request, Response } from 'express';
export declare const obtenerProductos: (req: Request, res: Response) => Promise<void>;
export declare const obtenerProductoPorId: (req: Request, res: Response) => Promise<void>;
export declare const crearProducto: (req: Request, res: Response) => Promise<void>;
export declare const actualizarProducto: (req: Request, res: Response) => Promise<void>;
export declare const eliminarProducto: (req: Request, res: Response) => Promise<void>;
export declare const buscarProductosPorNombre: (req: Request, res: Response) => Promise<void>;
export declare const obtenerProductosPorMarca: (req: Request, res: Response) => Promise<void>;
export declare const obtenerProductosConSKUs: (req: Request, res: Response) => Promise<void>;
export declare const obtenerCategoriasDeProducto: (req: Request, res: Response) => Promise<void>;
export declare const asignarCategoriaAProducto: (req: Request, res: Response) => Promise<void>;
export declare const obtenerResenasDeProducto: (req: Request, res: Response) => Promise<void>;
export declare const obtenerPromedioCalificacion: (req: Request, res: Response) => Promise<void>;
export declare const obtenerProductosMasVendidos: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=productoController.d.ts.map