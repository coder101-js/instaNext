
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server as NetServer, Socket } from 'net';
import { ClientToServerEvents, ServerToClientEvents } from '@/lib/socket-types';

// This is a custom type to extend the NextApiResponse object
type NextApiResponseWithSocket = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
    };
  };
};

// Disable the default body parser for this route, as we're hijacking the response
export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const httpServer = res.socket.server as HttpServer;
    const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
      path: '/api/socket_io',
      addTrailingSlash: false
    });
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on('joinRoom', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
      });

      socket.on('sendMessage', (message, recipientId) => {
        // Send the message to the recipient's room
        io.to(recipientId).emit('receiveMessage', message);
        console.log(`Message sent from ${message.senderId} to ${recipientId}`);
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }
  res.end();
}
