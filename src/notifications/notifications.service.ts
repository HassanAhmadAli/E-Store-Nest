import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications-gateway';

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: Date;
}

@Injectable()
export class NotificationsService {
    constructor(private notificationsGateway: NotificationsGateway) { }
    
    async createNotification(
        userId: string,
        title: string,
        message: string,
        type: Notification['type'] = 'info',
    ) {
        const notification: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            userId,
            title,
            message,
            type,
            read: false,
            createdAt: new Date(),
        };
        // Send real-time notification
        this.notificationsGateway.sendNotificationToUser(userId, notification);
        return notification;
    }

    async notifyMultipleUsers(
        userIds: string[],
        title: string,
        message: string,
        type: Notification['type'] = 'info',
    ) {
        const notifications = userIds.map((userId) => ({
            id: Math.random().toString(36).substr(2, 9),
            userId,
            title,
            message,
            type,
            read: false,
            createdAt: new Date(),
        }));
        // Send real-time notifications
        this.notificationsGateway.sendNotificationToUsers(userIds, {
            title,
            message,
            type,
        });
        return notifications;
    }

    async broadcastNotification(
        title: string,
        message: string,
        type: Notification['type'] = 'info',
    ) {
        const notification = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            message,
            type,
            createdAt: new Date(),
        };
        this.notificationsGateway.broadcastNotification(notification);
        return notification;
    }
}
