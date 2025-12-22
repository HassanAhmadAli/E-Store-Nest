import { BadRequestException, Injectable } from "@nestjs/common";
import { Namespace, Socket } from "socket.io";
import { MessageBody } from "@nestjs/websockets";
import { PrismaService } from "@/prisma";
import { InjectQueue } from "@nestjs/bullmq";
import { Keys } from "@/common/const";
import { Queue } from "bullmq";
import { Notification } from "./notification.interface";
import { JwtService } from "@nestjs/jwt";
import { ActiveUserSchema } from "@/iam/authentication/dto/request-user.dto";
import { CachingService } from "@/common/caching/caching.service";
import { Interval } from "@nestjs/schedule";

@Injectable()
export class NotificationsService {
  namespace!: Namespace;

  constructor(
    private readonly prismaService: PrismaService,
    @InjectQueue(Keys.notification) private readonly audioQueue: Queue,
    private readonly jwtService: JwtService,
    private readonly cachingService: CachingService,
  ) {}
  get prisma() {
    return this.prismaService.client;
  }
  setNamespace(namespace: Namespace) {
    this.namespace = namespace;
  }

  async handleRegister(socket: Socket, @MessageBody() accessToken: string) {
    const decoded = (await this.jwtService.verifyAsync(accessToken)) as unknown;
    const user = ActiveUserSchema.parse(decoded);
    await this.cachingService.socketIo.checkSocketid(socket.id);
    await this.cachingService.socketIo.registerSocket(socket.id, user.sub);
    return {
      email: user.email,
      message: "Socketio Connection Established Successfully",
    };
  }

  async handleDisconnect(client: Socket) {
    client.disconnect();
    await this.cachingService.socketIo.unRegisterSocket(client.id);
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
