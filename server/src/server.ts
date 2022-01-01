import * as express from 'express';
import * as http from 'http';
import {Server} from 'socket.io';

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000'
  }
});
const PORT = process.env.PORT || 8080;

interface IRoom {
  [key: string]: string[];
}

const rooms: IRoom = {};

io.on('connection', (socket) => {
  socket.on('joinRoom', (roomId: string) => {
    if (rooms[roomId]) rooms[roomId].push(socket.id);
    else rooms[roomId] = [socket.id];
    const otherUserId = rooms[roomId].find((id) => id !== socket.id);
    if (otherUserId) {
      // exchange both users ids
      socket.emit('otherUserId', otherUserId); // notify itself with the user it will connect with
      socket.to(otherUserId).emit('userJoined', socket.id); // notify the other user with the caller socket id
    }
  });

  // signaling
  // pass dto's from one peer to another
  socket.on('offer', (payload) => {
    io.to(payload.target).emit('offer', payload);
  });

  socket.on('answer', (payload) => {
    io.to(payload.target).emit('answer', payload);
  });

  socket.on('ICECandidate', (payload) => {
    io.to(payload.target).emit('ICECandidate', payload.candidate);
  })

});

httpServer.listen(PORT, () =>
  console.log(`server is running on port: ${PORT}`)
);
