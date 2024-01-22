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
  console.log(`用户连接: ${socket.id}, \t当前用户数: ${io.engine.clientsCount}`);

  // 监听加入房间事件
  socket.on("join-room", (roomName, callback) => {
    socket.join(roomName);
    // 广播消息回调，用于确认服务端是否收到消息
    if (typeof callback === "function") {
      // socket.rooms 为用户加入的房间，用户连接默认会加入自己id相同的房间
      callback({ state: true, joinRooms: [...socket.rooms] });
    }
  });

  // 监听消息广播事件 { room: 'roomName', msg: { from: 'server', type: '1', time: '2024-01-22 00:00:00', content: 'msg' } }
  socket.on("send", (data) => {
    // 添加消息传输人信息
    if (data && data.msg) {
      data.msg.from = socket.id;
    }
    // 分发消息
    socket.in(data.room).emit("send", data.msg);
  });

  // 监听掉线事件
  socket.on("disconnect", (reason) => {
    console.log(
      `用户掉线: ${socket.id}, \t原因: ${reason}, \t当前用户数: ${io.engine.clientsCount}`
    );
  });
});

httpServer.listen(3000);
console.log('服务启动成功，监听端口：3000');
