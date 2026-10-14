import { Server as SocketIOServer } from 'socket.io';
import { VolatileStore } from './storage/types';
import { getVolatileStore } from './storage';

declare global {
  // eslint-disable-next-line no-var
  var __igotq_store__: VolatileStore | undefined;
  // eslint-disable-next-line no-var
  var __igotq_io__: SocketIOServer | undefined;
}

export function getServerStore(): VolatileStore {
  if (!globalThis.__igotq_store__) {
    globalThis.__igotq_store__ = getVolatileStore();
  }
  return globalThis.__igotq_store__;
}

export function setServerIO(io: SocketIOServer): void {
  globalThis.__igotq_io__ = io;
}

export function getServerIO(): SocketIOServer | undefined {
  return globalThis.__igotq_io__;
}
