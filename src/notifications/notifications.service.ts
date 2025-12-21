import { Injectable } from "@nestjs/common";
import { Namespace, Socket } from "socket.io";
import { MessageBody } from "@nestjs/websockets";
import { logger } from "@/utils";
import { Interval } from "@nestjs/schedule";
import { PrismaService } from "@/prisma";
import { InjectQueue } from "@nestjs/bullmq";
import { Keys } from "@/common/const";
import { Queue } from "bullmq";
import { Notification } from "./notification.interface";
@Injectable()
export class NotificationsService {
  namespace!: Namespace;

  constructor(
    private readonly prismaService: PrismaService,
    @InjectQueue(Keys.notification) private audioQueue: Queue,
  ) {}
  get prisma() {
    return this.prismaService.client;
  }
  setNamespace(namespace: Namespace) {
    this.namespace = namespace;
  }

  @Interval(5 * 1000)
  async x() {
    logger.info("interval");
    logger.info(await this.audioQueue.count());
    // const job = await this.audioQueue.add("transcode", {
    //   foo: "bar",
    // });
  }
  private userSockets = new Map<string, string>();

  async handleRegister(socket: Socket, @MessageBody() userId: string) {
    await socket.join("userId");
    this.userSockets.set(userId, socket.id);
    logger.info(`User ${userId} registered with socket ID: ${socket.id}`);
    const message = {
      success: true,
      data: "Registered successfully",
    };
    return message;
  }

  async handleDisconnect(client: Socket) {
    logger.info(`Client disconnected: ${client.id}`);
    // Remove user from map
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        await client.leave(userId);
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
    this.namespace.to(userId).emit("notification", notification);
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
      this.namespace.to(userId).emit("notification", {
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
    this.namespace.emit("notification", notification);

    return notification;
  }
}
