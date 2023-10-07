import express from 'express';

export const MRoute = (request : express.Request, response : express.Response, next:express.NextFunction ) => {
    next();
  
}