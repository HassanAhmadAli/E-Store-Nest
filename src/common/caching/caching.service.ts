import { logger } from "@/utils";
import { Cache } from "@nestjs/cache-manager";
import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class CachingService {
  constructor(public readonly cacheManager: Cache) {}
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
      const exist = await this.cacheManager.get(socketIdKey);
      if (exist) {
        logger.trace(`this socket is already registered ${socket_id}`);
        throw new BadRequestException("this socket is already registered");
      }
    },
    registerSocket: async (socket_id: string, userId: number) => {
      const socketIdKey = this.socketIo.generateKeys.socketId(socket_id);
      const socket_userId_key = this.socketIo.generateKeys.userId(userId);
      await this.cacheManager.set(socketIdKey, userId);
      await this.cacheManager.set(socket_userId_key, socket_id);
    },
    unRegisterSocket: async (socket_id: string) => {
      const socketIdKey = this.socketIo.generateKeys.socketId(socket_id);
      await this.cacheManager.del(socketIdKey);
      const userId = await this.socketIo.getUserId(socket_id);
      if (userId == undefined) return;
      const socket_userId_key = this.socketIo.generateKeys.userId(userId);
      await this.cacheManager.del(socket_userId_key);
    },
    getUserId: async (socket_id: string) => {
      const socketIdKey = this.socketIo.generateKeys.socketId(socket_id);
      const exist = await this.cacheManager.get<number>(socketIdKey);
      if (exist) return exist;
      throw new BadRequestException("socket was not registred yet");
    },
  } as const;
}
