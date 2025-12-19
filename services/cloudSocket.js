// services/cloudSocket.js
const http = require("http");
const { Server } = require("socket.io");

let io = null;
const AGENT_TOKEN = process.env.AGENT_TOKEN || "secret_agent_token";

function initSocket({ app = null, port = 3001 } = {}) {
  const server = app ? http.createServer(app) : http.createServer();
  io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    const { token } = socket.handshake.query || {};
    console.log("Agent connection attempt", socket.id);

    if (token !== AGENT_TOKEN) {
      socket.emit("unauthorized");
      return socket.disconnect(true);
    }

    console.log("✅ Agent connected", socket.id);
    socket.join("agent_room");

    socket.on("ack", (payload) => {
      console.log("ACK from agent:", payload);
    });
  });

  server.listen(port, () =>
    console.log(`Socket.IO server running on ${port}`)
  );

  return { io };
}

function emitPayment(payload) {
  if (!io) {
    console.error("Socket not initialized");
    return false;
  }

  // payload MUST contain sl_no (number)
  if (!Number.isInteger(payload.sl_no)) {
    console.error("Invalid payload.sl_no", payload.sl_no);
    return false;
  }

  io.to("agent_room").emit("payment.created", payload);
  console.log("📤 Emitted payment.created", payload.sl_no);
  return true;
}

module.exports = { initSocket, emitPayment };
