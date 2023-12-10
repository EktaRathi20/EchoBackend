import express from "express";
import multer from "multer";
import { storage } from "../utility/audioUpload";
import { FamilyController } from "../controllers/FamilyController";
const upload = multer({ storage });
export const familyRoute: express.Router = express.Router();

familyRoute.get("/getFamilyList/:userId", FamilyController.getFamilyRooms);
familyRoute.post("/createFamilyRoom", FamilyController.createFamilyRoom);
familyRoute.get("/joinFamilyRoom", FamilyController.joinFamilyRoom);
familyRoute.get("/getFamilyById/:roomId", FamilyController.getFamilyById);
familyRoute.post(
  "/createFamilyPost",
  upload.single("audio"),
  FamilyController.createFamilyPost
);
familyRoute.get('/getAllFamilyPost/:familyId', FamilyController.getFamilyPost);