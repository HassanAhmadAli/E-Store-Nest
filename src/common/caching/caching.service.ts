import { PrismaService, User } from "@/prisma";
import { logger } from "@/utils";
import { Cache } from "@nestjs/cache-manager";
import { BadRequestException, Injectable } from "@nestjs/common";
import { cachedUserPayload } from "./user.cachedpayload.interface";

@Injectable()
export class CachingService {
  constructor(
    public readonly manager: Cache,
    private readonly prismaService: PrismaService,
  ) {}

  public get prisma() {
    return this.prismaService.client;
  }

  public readonly socketIo = {
    generateKeys: {
      userId(userId: number) {
        return `socketio-user_id-${userId}`;
      },
      socketId(socket_id: string) {
        return `socketio-socket_id-${socket_id}`;
      },
    },
    checkSocketid: async (socket_id: string) => {
      const socketIdKey = this.socketIo.generateKeys.socketId(socket_id);
      const exist = await this.manager.get(socketIdKey);
      if (exist) {
        logger.trace(`this socket is already registered ${socket_id}`);
        throw new BadRequestException("this socket is already registered");
      }
    },
    registerSocket: async (socket_id: string, userId: number) => {
      const socketIdKey = this.socketIo.generateKeys.socketId(socket_id);
      const socket_userId_key = this.socketIo.generateKeys.userId(userId);
      await this.manager.set(socketIdKey, userId);
      await this.manager.set(socket_userId_key, socket_id);
    },
    unRegisterSocket: async (socket_id: string) => {
      const socketIdKey = this.socketIo.generateKeys.socketId(socket_id);
      await this.manager.del(socketIdKey);
      const userId = await this.socketIo.getUserId(socket_id);
      if (userId == undefined) return;
      const socket_userId_key = this.socketIo.generateKeys.userId(userId);
      await this.manager.del(socket_userId_key);
    },
    getUserId: async (socket_id: string) => {
      const socketIdKey = this.socketIo.generateKeys.socketId(socket_id);
      const exist = await this.manager.get<number>(socketIdKey);
      if (exist) return exist;
      return undefined;
    },
    getSocketid: async (userId: number) => {
      const socketIdKey = this.socketIo.generateKeys.userId(userId);
      const exist = await this.manager.get<string>(socketIdKey);
      if (exist) return exist;
      throw new BadRequestException("socket was not registred yet");
    },
  } as const;

  public readonly users = {
    generateKeys: {
      userData(userId: number) {
        return `user-data-userid-${userId}`;
      },
    },
    removeCachedUserData: async (userId: number) => {
      const key = this.users.generateKeys.userData(userId);
      await this.manager.del(key);
    },
    getCachedUserData: async (userId: number): Promise<cachedUserPayload> => {
      const key = this.users.generateKeys.userData(userId);
      const cachedUserData = await this.manager.get<cachedUserPayload>(key);
      if (cachedUserData != undefined) {
        return cachedUserData;
      }
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
        },
      });
      await this.manager.set(key, user, 60 * 1000);
      return user;
    },
  } as const;
}
