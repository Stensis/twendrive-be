import { Response } from 'express';
import { AuthenticatedRequest } from 'src/types/express';
import * as notificationService from './notificationService';

export const getMyNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = await notificationService.getUserNotifications(Number(req.user?.id));
    res.status(200).json({ notifications });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  try {
    await notificationService.markNotificationRead(id, Number(req.user?.id));
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};