import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'src/types/express';
import * as carDocumentService from './carDocumentService';

export const uploadCarDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const carId = Number(req.params.carId);
    const { title, type, url } = req.body;
    const userId = req.user!.id;

    const result = await carDocumentService.uploadDocument({ carId, title, type, url, userId });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to upload document', error: err.message });
  }
};

export const getCarDocuments = async (req: Request, res: Response) => {
  try {
    const carId = Number(req.params.carId);
    const result = await carDocumentService.getDocuments(carId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch documents', error: err.message });
  }
};

export const deleteCarDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const documentId = Number(req.params.documentId);
    const result = await carDocumentService.deleteDocument(documentId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to delete document', error: err.message });
  }
};
