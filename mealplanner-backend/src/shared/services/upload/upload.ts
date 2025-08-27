import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../../config/index.js';

export class UploadService {
  private uploadDir: string;
  private upload: multer.Multer;

  constructor() {
    this.uploadDir = path.join(process.cwd(), config.UPLOAD_DIR);
    
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

    this.upload = multer({
      storage: storage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'));
        }
      }
    });
  }

  getUploadMiddleware() {
    return this.upload;
  }

  getUploadDir() {
    return this.uploadDir;
  }
}
