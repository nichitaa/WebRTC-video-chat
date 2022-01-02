import * as express from 'express';
import * as http from 'http';
import { Server } from 'socket.io';
import { config } from 'dotenv';

config();

const CORS_ORIGIN_BASE_URL = process.env.CORS_ORIGIN_BASE_URL || 'http://localhost:3000';
const PORT = process.env.PORT || 8080;

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CORS_ORIGIN_BASE_URL },
});

interface IRoom {
  [key: string]: { socketId: string, nickname: string }[];
}

interface ISignalDto {
  roomId: string,
  nickname: string
}

const rooms: IRoom = {};

io.on('connection', (socket) => {

  socket.on('joinRoom', (args: ISignalDto) => {
    const { roomId, nickname } = args;

    if (rooms[roomId]) rooms[roomId].push({ socketId: socket.id, nickname });
    else rooms[roomId] = [{ socketId: socket.id, nickname }];
    const otherUser = rooms[roomId].find((item) => item.socketId !== socket.id);

    if (otherUser && otherUser.socketId !== socket.id) {
      // Peer 2 -> Peer 1 (notify the caller that Peer 2 just joined the room)
      socket.to(otherUser.socketId).emit('userJoined', { otherUserSocketId: socket.id, otherUserNickname: nickname });
      socket.emit('waitingToBeAcceptedBy', otherUser.nickname);
    }
    console.log('joinRoom rooms: ', rooms);
  });

  socket.on('callAccepted', (args: ISignalDto) => {
    const { roomId, nickname } = args;

    const room = rooms[roomId];
    const otherUser = room.find((item) => item.socketId !== socket.id);
    if (otherUser) {
      // Peer 1 -> Peer 1 (gets the information about the receiver Peer 2)
      socket.emit('otherUserId', { otherUserSocketId: otherUser.socketId, otherUserNickname: otherUser.nickname });
      // Peer 1 -> Peer 2 (notify Peer 2 about the caller)
      socket.to(otherUser.socketId).emit('acceptedBy', nickname);
    }
  });

  /**
   * Signaling
   * Just passing DTOs from one peer to another
   */
  socket.on('offer', (payload) => {
    io.to(payload.target).emit('offer', payload);
  });

  socket.on('answer', (payload) => {
    io.to(payload.target).emit('answer', payload);
  });

  socket.on('ICECandidate', (payload) => {
    io.to(payload.target).emit('ICECandidate', payload.candidate);
  });

  /**
   * on disconnect - reject call utilities
   */
  socket.on('disconnect', (reason: string) => {
    let roomId: string | null = null;
    for (let id in rooms) {
      const found = rooms[id].find(item => item.socketId === socket.id);
      if (found) {
        roomId = id;
        break;
      }
    }
    if (roomId) {
      const room = rooms[roomId];
      const otherUser = room.find((item) => item.socketId !== socket.id);
      rooms[roomId] = rooms[roomId].filter(el => el.socketId !== socket.id);
      // notify the other user about disconnection
      if (otherUser) socket.to(otherUser.socketId).emit('otherUserDisconnected', otherUser.nickname);
    }
    console.log('disconnect rooms: ', rooms);
  });

  socket.on('callRejected', (args: ISignalDto) => {
    const { roomId, nickname } = args;

    const otherUser = rooms[roomId].find(el => el.socketId !== socket.id);
    if (otherUser) {
      rooms[roomId] = rooms[roomId].filter(el => el.socketId !== otherUser.socketId);
      socket.to(otherUser.socketId).emit('callRejected', nickname);
    }
    console.log('callRejected rooms: ', rooms);
  });

});

httpServer.listen(PORT, () =>
  console.log(`server is running on port: ${PORT}`),
);
