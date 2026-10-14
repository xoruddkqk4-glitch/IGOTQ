import os from 'os';
import { AdminMetrics } from '@/types/settings';

let lastCpuUsage = process.cpuUsage();
let lastCpuCheckTime = Date.now();

export function collectMetrics(activeRoomsCount: number, totalParticipants: number): AdminMetrics {
  const memUsage = process.memoryUsage();
  const now = Date.now();
  const timeDiff = (now - lastCpuCheckTime) * 1000; // in microseconds

  const currentCpu = process.cpuUsage(lastCpuUsage);
  lastCpuUsage = process.cpuUsage();
  lastCpuCheckTime = now;

  const totalCpuTime = currentCpu.user + currentCpu.system;
  const cpuPercent = timeDiff > 0 ? Math.min(100, Math.round((totalCpuTime / (timeDiff * os.cpus().length)) * 100)) : 0;

  return {
    activeRoomsCount,
    totalParticipants,
    memoryUsageMb: Math.round(memUsage.rss / (1024 * 1024)),
    cpuUsagePercent: cpuPercent,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}
