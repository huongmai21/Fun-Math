// server.js
const app = require("./app");
const connectMongoDB = require("./config/mongo");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

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
