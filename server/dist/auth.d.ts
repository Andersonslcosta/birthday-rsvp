import express, { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    admin?: {
        authenticated: boolean;
    };
}
export declare function validateJWTSecret(): void;
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): express.Response<any, Record<string, any>> | undefined;
export declare function generateToken(): string;
//# sourceMappingURL=auth.d.ts.map