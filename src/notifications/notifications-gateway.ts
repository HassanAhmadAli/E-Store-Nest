import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*', }, namespace: '/notifications', })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server!: Server;
    private logger: Logger = new Logger('NotificationsGateway');
    private userSockets = new Map<string, string>(); // userId -> socketId           
    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        // Remove user from map
        for (const [userId, socketId] of this.userSockets.entries()) {
            if (socketId === client.id) {
                this.userSockets.delete(userId);
                client.leave(`user:${userId}`);
                break;
            }
        }
    }
    @SubscribeMessage('register')
    handleRegister(@ConnectedSocket() client: Socket, @MessageBody() userId: string) {
        client.join(`user:${userId}`);
        this.userSockets.set(userId, client.id);
        this.logger.log(`User ${userId} registered with socket ID: ${client.id}`);
        return { success: true, message: 'Registered successfully' };
    }
    sendNotificationToUser(userId: string, notification: any) {
        this.server.to(`user:${userId}`).emit('notification', notification);
    }
    sendNotificationToUsers(userIds: string[], notification: any) {
        userIds.forEach((userId) => {
            this.server.to(`user:${userId}`).emit('notification', notification);
        });
    }
    broadcastNotification(notification: any) {
        this.server.emit('notification', notification);
    }
}