import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  WebSocketServer,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";
import { NotificationsService } from "./notifications.service";
import { logger } from "@/utils";
import { UseInterceptors } from "@nestjs/common";
import { TimeoutInterceptor } from "@/common/interceptors/timeout.interceptor";
@UseInterceptors(TimeoutInterceptor)
@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "/notifications",
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  constructor(private readonly notificationsService: NotificationsService) {}
  @WebSocketServer()
  private namespace!: Namespace;

  afterInit(namespace: Namespace) {
    this.notificationsService.setNamespace(namespace);
  }

  handleConnection(client: Socket) {
    logger.info(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    return this.notificationsService.handleDisconnect(client);
  }

  @SubscribeMessage("register")
  async handleRegister(@ConnectedSocket() socket: Socket, @MessageBody() userId: string) {
    return await this.notificationsService.handleRegister(socket, userId);
  }
}
