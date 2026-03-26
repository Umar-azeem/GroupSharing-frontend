import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
});
