const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.use((socket, next) => {
  // 当传输token时，使用token作为id
  if (socket.handshake.auth.token) {
    // @ts-ignore
    socket.id = socket.handshake.auth.token;
  }
  next();
});

// 监听新连接
io.on("connection", (socket) => {
  console.log(
    `connection: ${socket.id}, user count: ${io.engine.clientsCount}`
  );

  // 监听加入房间事件
  socket.on("join-room", (roomName, callback) => {
    socket.join(roomName);
    // 广播消息回调，用于确认服务端是否收到消息
    if (typeof callback === "function") {
      callback({ state: true, room: [...socket.rooms] });
    }
  });

  // 监听消息广播事件
  socket.on("send", (data) => {
    // 添加消息传输人信息
    if (data && data.msg) {
      data.msg.from = socket.id;
    }
    // 分发消息
    socket.to(data.room).emit(data.msg);
  });

  // 监听掉线事件
  socket.on("disconnect", (reason) => {
    console.log(
      `disconnect: ${socket.id}, reason: ${reason}, user count: ${io.engine.clientsCount}`
    );
  });
});

httpServer.listen(3000);
