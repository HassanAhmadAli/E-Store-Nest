import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { MessageBody } from "@nestjs/websockets";
import { logger } from "@/utils";
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
}
@Injectable()
export class NotificationsService {
  server!: Server;
  setServer(server: Server) {
    this.server = server;
  }
  private userSockets = new Map<string, string>();

  async handleRegister(client: Socket, @MessageBody() userId: string) {
    await client.join(`user:${userId}`);
    this.userSockets.set(userId, client.id);
    logger.info(`User ${userId} registered with socket ID: ${client.id}`);
    const message = { success: true, message: "Registered successfully" };
    logger.debug({ isInstanceOf: this.server });
    // this.server.emit("notification", message);
    return message;
  }

  async handleDisconnect(client: Socket) {
    logger.info(`Client disconnected: ${client.id}`);
    // Remove user from map
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        await client.leave(`user:${userId}`);
        break;
      }
    }
  }

  createNotification(userId: string, title: string, message: string, type: Notification["type"] = "info") {
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
    this.server.to(`user:${userId}`).emit("notification", notification);
    return notification;
  }

  notifyMultipleUsers(userIds: string[], title: string, message: string, type: Notification["type"] = "info") {
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
    userIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit("notification", {
        title,
        message,
        type,
      });
    });
    return notifications;
  }

  broadcastNotification(title: string, message: string, type: Notification["type"] = "info") {
    const notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      createdAt: new Date(),
    };
    this.server.emit("notification", notification);

    return notification;
  }
}
