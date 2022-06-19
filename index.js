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
    socket.id = socket.handshake.auth.token;
  }
  next();
});

// 监听新连接
io.on("connection", (socket) => {
  console.log(
    `new user connection: ${socket.id}, current user count: ${io.engine.clientsCount}`
  );

  // 监听加入房间事件
  socket.on("join-room", (data) => {
    socket.join(data);
    console.log(`join-room: ${socket.id} , room list: `, socket.rooms);
  });

  // 监听消息广播事件
  socket.on("send", (data, callback) => {
    // 通知房间用户
    socket.to(data.room).emit(data.data);
    // 广播消息回调，用于确认服务端是否收到消息
    if (typeof callback === "function") {
      callback("ok");
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`user disconnect: ${socket.id}, reason: ${reason}`);
  });
});

httpServer.listen(3000);
