const { addNotification, getNotifications, sendSMS } = require("../services/notificationService");
const { Server } = require("socket.io");

const setupNotificationSocket = (server) => {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("sendNotification", (data) => {
      console.log("New Notification:", data);

      addNotification(data); // Store notification
      io.emit("newNotification", data); // Broadcast to all clients

      // Send SMS only for selected types
      if (["General Announcement", "Event Announcement", "Academic Results"].includes(data.type)) {
        sendSMS(data);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = { setupNotificationSocket };
