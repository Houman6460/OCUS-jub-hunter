import fs from 'fs';
import path from 'path';
import { type Order, type Product } from '@shared/schema';

class FileService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadsDirectory();
  }

  private ensureUploadsDirectory(): void {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async getFileForDownload(order: Order, product: Product): Promise<{ filePath: string; fileName: string; mimeType: string }> {
    const filePath = path.join(this.uploadsDir, product.filePath);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    // Verify order is completed and within download limits
    if (order.status !== 'completed') {
      throw new Error('Order not completed');
    }

    if ((order.downloadCount || 0) >= (order.maxDownloads || 1)) {
      throw new Error('Download limit exceeded');
    }

    return {
      filePath,
      fileName: product.fileName,
      mimeType: 'application/x-chrome-extension'
    };
  }

  async saveUploadedFile(file: Buffer, fileName: string): Promise<string> {
    const filePath = path.join(this.uploadsDir, fileName);
    await fs.promises.writeFile(filePath, file);
    return fileName;
  }

  async deleteFile(fileName: string): Promise<void> {
    const filePath = path.join(this.uploadsDir, fileName);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  getFilePath(fileName: string): string {
    return path.join(this.uploadsDir, fileName);
  }
}

export const fileService = new FileService();
