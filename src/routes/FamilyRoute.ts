import express from "express";
import { FamilyController } from "../controllers/FamilyController";

export const familyRoute: express.Router = express.Router();

familyRoute.get('/getFamilyList/:userId', FamilyController.getFamilyRooms);
familyRoute.post('/createFamilyRoom', FamilyController.createFamilyRoom);
familyRoute.get('/joinFamilyRoom', FamilyController.joinFamilyRoom);
familyRoute.get('/getFamilyById/:roomId',FamilyController.getFamilyById);