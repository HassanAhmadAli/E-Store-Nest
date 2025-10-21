import Pino from "pino";
import PinoPretty from "pino-pretty";

export const pino = Pino({
  level: "trace",
  timestamp: true,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
      ignore: "pid,hostname",
      singleLine: true,
      colorizeObjects: true,
    } satisfies PinoPretty.PrettyOptions,
  },
});
export const getStatusColor = (status: number) => {
  if (status >= 500) {
    // red
    return "\x1b[31m";
  }
  if (status >= 400) {
    // yellow
    return "\x1b[33m";
  }
  if (status >= 200) {
    // green
    return "\x1b[32m";
  }
  // default
  return "\x1b[0m";
};
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}(B)`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}(KB)`;
  return `${(bytes / 1048576).toFixed(1)}(MB)`;
}
