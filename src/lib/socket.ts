import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getClientSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io({
      autoConnect: false,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      reconnectionDelayMax: 2000,
      transports: ['websocket', 'polling'],
      timeout: 8000,
    });
  }
  return socketInstance;
}
