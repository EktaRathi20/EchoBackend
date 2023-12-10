import express from "express";
import multer from "multer";
import { storage } from "../utility/audioUpload";
import { FamilyController } from "../controllers/FamilyController";
const upload = multer({ storage });
export const familyRoute: express.Router = express.Router();

familyRoute.get("/getFamilyList/:userId", FamilyController.getFamilyRooms);
familyRoute.post("/createFamilyRoom", FamilyController.createFamilyRoom);
familyRoute.post("/joinFamilyRoom", FamilyController.joinFamilyRoom);
familyRoute.get("/getFamilyById/:roomId", FamilyController.getFamilyById);
familyRoute.post(
  "/createFamilyPost",
  upload.single("audio"),
  FamilyController.createFamilyPost
);
familyRoute.get('/getAllFamilyPost', FamilyController.getFamilyPost);
familyRoute.get('/getFamilyMembers/:familyId', FamilyController.getFamilyMembers)
familyRoute.delete('/removeFamilyMember', FamilyController.removeFamilyMember)
familyRoute.put('/updateFamilyName', FamilyController.updateFamilyName);
familyRoute.delete('/deleteFamily', FamilyController.deleteFamilyRoom);
