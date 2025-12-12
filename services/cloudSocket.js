// services/cloudSocket.js
const http = require('http');
const { Server } = require('socket.io');

let io = null;
let AGENT_TOKEN = process.env.AGENT_TOKEN || 'secret_agent_token';

function initSocket({ app = null, port = 3001 } = {}) {
  const server = app ? http.createServer(app) : http.createServer();
  io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    const { token } = socket.handshake.query || {};
    console.log('Agent connection attempt', socket.id);

    if (!token || token !== AGENT_TOKEN) {
      console.warn('Unauthorized agent connection', socket.id);
      socket.emit('unauthorized', { message: 'Invalid token' });
      return socket.disconnect(true);
    }

    console.log(`Agent connected (socket ${socket.id})`);
    socket.join('agent_room'); // single-room for this deployment

    socket.on('ack', (payload) => {
      console.log('ACK from agent', payload && payload.payment_id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Agent disconnected', socket.id, reason);
    });
  });

  server.listen(port, () => console.log(`Socket.IO server listening on ${port}`));
  return { io };
}

function emitPayment(payload) {
  if (!io) {
    console.error('Socket not initialized, cannot emit');
    return false;
  }
  io.to('agent_room').emit('payment.created', payload);
  console.log('Emitted payment.created', payload && payload.payment_id);
  return true;
}

module.exports = { initSocket, emitPayment };
