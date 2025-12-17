import { logger } from "@/utils";
import { ArgumentsHost, HttpException } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

export abstract class AppBaseExceptionFilter extends BaseExceptionFilter {
  override catch(error: Error, host: ArgumentsHost) {
    if (host.getType() === "http") {
      return super.catch(error, host);
    }
    if (host.getType() !== "ws") {
      throw new Error("using trpc without specifiying how to handle it");
    }
    if (error instanceof WsException) {
      return super.catch(error, host);
    }
    const client = host.switchToWs().getClient<Socket>();
    if (error instanceof HttpException) {
      return client.emit("exception", error.getResponse());
    }
    try {
      logger.error({ error });
    } catch (loggingError) {
      console.error("CRITICAL: Logger failed. Original error message:", error.message);
      console.error("Logging failed with:", (loggingError as Error).message);
    }
    return client.emit("exception", {
      statusCode: 500,
      message: error.message,
    });
  }
}
