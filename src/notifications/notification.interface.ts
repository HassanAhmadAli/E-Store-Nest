export interface Notification {
  title: string;
  userId: number;
  email: string | null;
  message: string;
  type: "info" | "success" | "warning" | "error";
  // read: boolean;
  createdAt: Date;
}
