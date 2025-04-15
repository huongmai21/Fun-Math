// server.js
const app = require("./app");
const connectMongoDB = require("./config/mongo");
const path = require("path");
// const http = require("http");
// const { Server } = require("socket.io");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });



// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3001",
//     methods: ["GET", "POST"],
//   },
// });

// Socket.io
// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   socket.on("joinExam", (data) => {
//     io.emit("examNotification", {
//       message: `${data.username} vừa tham gia một kỳ thi!`,
//     });
//   });

//   socket.on("newMessage", (data) => {
//     io.emit("messageNotification", {
//       message: `Tin nhắn mới từ ${data.username} trong phòng học nhóm!`,
//     });
//   });

//   socket.on("disconnect", () => {
//     console.log("A user disconnected:", socket.id);
//   });
// });



const PORT = process.env.PORT || 3000;

// Kết nối với cơ sở dữ liệu
connectMongoDB();

const server = app.listen(PORT, () => {
  console.log(`Server đang chạy ở cổng ${PORT}`);
});

// Xử lý lỗi không xử lý được
process.on("unhandledRejection", (err) => {
  console.log(`Lỗi: ${err.message}`);
  server.close(() => process.exit(1));
});
