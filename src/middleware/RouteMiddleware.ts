import express from 'express';
// import { verifyAccessToken } from '../utility/verifyToken'; 
export const routeMiddleware  = (request : express.Request, response : express.Response, next:express.NextFunction ) => {
    // TODO - just added the logic related to the access token 

    /*
        const token = request.accessToken;
        if (!token) return response.status(401).json({ error: "Unauthorized: Token is missing." });
        try{
            const user = await verifyAccessToken(token);
            if (user) {
                req.user = user;
                next(); // Proceed to the next middleware or route handler
            } else {
              return response.status(403).json({ error: 'Forbidden: Token is invalid.' });
            }
        } catch (error) {
            return res.status(403).json({ error: 'Forbidden: Token is invalid.' });
        }
    */
    next();
}
