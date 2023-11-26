import multer from 'multer';
import path from 'path';

// Configure multer to handle file uploads
export const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // Set the destination folder for uploads
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, Date.now() + ext); // Use current timestamp as the filename to avoid duplicates
    },
  });
  