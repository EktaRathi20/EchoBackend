import express from 'express';

export const routeMiddleware  = (request : express.Request, response : express.Response, next:express.NextFunction ) => {
    next();
}