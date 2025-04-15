// server.js
const app = require("./app");
const connectMongoDB = require("./config/mongo");
// const { sequelize, connectDB } = require("./models/mysql");
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


// // Hàm khởi động server
// const startServer = async () => {
//   try {
//     // Kết nối MongoDB và MySQL
//     await Promise.all([connectMongoDB(), connectMySQL()]);

//     const PORT = process.env.PORT || 3000;
//     server.listen(PORT, () => {
//       console.log(`Server đang chạy trên cổng ${PORT}`);
//     });
//   } catch (err) {
//     console.error("Không thể khởi động server:", err);
//     process.exit(1);
//   }
// };

// // Khởi động server
// startServer();


const PORT = process.env.PORT || 3000;

// Kết nối với cơ sở dữ liệu
connectDB();
connectMongoDB();

const server = app.listen(PORT, () => {
  console.log(`Server đang chạy ở cổng ${PORT}`);
});

// Xử lý lỗi không xử lý được
process.on("unhandledRejection", (err) => {
  console.log(`Lỗi: ${err.message}`);
  server.close(() => process.exit(1));
});
