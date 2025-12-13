import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { NotificationsService } from "./notifications.service";
import { logger } from "@/utils";

@WebSocketGateway({ cors: { origin: "*" }, namespace: "/notifications" })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  constructor(private readonly notificationsService: NotificationsService) {
    this.notificationsService.setServer(this.server);
  }
  handleConnection(client: Socket) {
    logger.info(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    return this.notificationsService.handleDisconnect(client);
  }

  @SubscribeMessage("register")
  async handleRegister(@ConnectedSocket() client: Socket, @MessageBody() userId: string) {
    return this.notificationsService.handleRegister(client, userId);
  }
}
