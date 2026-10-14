import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getClientSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io({
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
}
