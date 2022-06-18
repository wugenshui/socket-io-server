const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// 监听新连接
io.on("connection", (socket) => {
  console.log(
    `new client connection: ${socket.id},current count: ${io.engine.clientsCount}`
  );

  // 监听加入房间事件
  socket.on("join-room", (data) => {
    socket.join(data);
    console.log(`${socket.id} join-room,in room: `, socket.rooms);
  });

  // 监听消息广播事件
  socket.on("send", (data, callback) => {
    // 通知房间用户
    socket.to(data.room).emit(data.data);
    console.log("send", socket.id);
    // 广播消息回调，用于确认服务端是否收到消息
    if (typeof callback === "function") {
      callback("ok");
    }
  });
});

httpServer.listen(3000);
