import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
    constructor(private notificationsService: NotificationsService) { }
    @Post('send')
    async sendNotification(@Body() body: {
        userId: string;
        title: string;
        message: string;
        type?: 'info' | 'success' | 'warning' | 'error';
    }) {
        return this.notificationsService.createNotification(
            body.userId,
            body.title,
            body.message,
            body.type,
        );
    }

    @Post('broadcast')
    async broadcastNotification(@Body() body: {
        title: string;
        message: string;
        type?: 'info' | 'success' | 'warning' | 'error';
    }) {
        return this.notificationsService.broadcastNotification(
            body.title,
            body.message,
            body.type,
        );
    }
}
