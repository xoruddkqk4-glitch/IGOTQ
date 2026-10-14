import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { setServerIO } from './src/server/context';
import { setupSocketServer } from './src/server/socketServer';
import { startExpirySweeper } from './src/server/expirySweeper';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function bootstrap() {
  try {
    await app.prepare();

    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url!, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    const io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    setServerIO(io);
    setupSocketServer(io);
    startExpirySweeper();

    server.listen(port, () => {
      console.log(`> 🚀 IGOTQ server ready on http://${hostname}:${port}`);
    });
  } catch (err) {
    console.error('Error starting IGOTQ server:', err);
    process.exit(1);
  }
}

bootstrap();
