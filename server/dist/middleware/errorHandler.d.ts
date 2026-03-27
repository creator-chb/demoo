import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    code: number;
    isOperational: boolean;
    constructor(code: number, message: string, isOperational?: boolean);
}
export declare const errorHandler: (err: Error | AppError, req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => void;
export default errorHandler;
//# sourceMappingURL=errorHandler.d.ts.map