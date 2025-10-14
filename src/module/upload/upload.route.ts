import express from "express";
import { upload } from "./multer.config";
import { uploadImage } from "./upload.controller";


const router = express.Router();

// Single file
router.post("/image", upload.single("image"), uploadImage);

// Multiple files
router.post("/images", upload.array("images", 5), uploadImage);

export default router;
