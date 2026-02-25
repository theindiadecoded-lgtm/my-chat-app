require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const Room = require("./models/Room");
const Message = require("./models/Message");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"));

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
app.use(express.json());

let users = {};

io.on("connection", (socket) => {

  socket.on("joinRoom", async ({ name, code }) => {

    let room = await Room.findOne({ code });
    if (!room) {
      room = await Room.create({ code });
    }

    socket.join(code);
    users[socket.id] = { name, code };

    const oldMessages = await Message.find({ room: code });
    socket.emit("loadMessages", oldMessages);

    io.to(code).emit("userCount",
      io.sockets.adapter.rooms.get(code)?.size || 0
    );

    socket.to(code).emit("systemMessage", {
      text: `${name} joined`,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on("typing", () => {
    const user = users[socket.id];
    socket.to(user.code).emit("typing", user.name);
  });

  socket.on("chatMessage", async (data) => {
    const message = {
      ...data,
      time: new Date().toLocaleTimeString()
    };

    await Message.create({ ...message, room: data.code });

    io.to(data.code).emit("message", message);
  });

  socket.on("imageMessage", async (data) => {
    const message = {
      ...data,
      time: new Date().toLocaleTimeString()
    };

    await Message.create({ ...message, room: data.code });

    io.to(data.code).emit("imageMessage", message);
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (!user) return;

    io.to(user.code).emit("userCount",
      io.sockets.adapter.rooms.get(user.code)?.size || 0
    );

    delete users[socket.id];
  });

});

server.listen(process.env.PORT, () =>
  console.log("🚀 Running on " + process.env.PORT)
);
