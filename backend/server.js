const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect("mongodb+srv://vehicles_rental:0504@rental.vhr9wrd.mongodb.net/vehicles_rental?appName=rental", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Kết nối MongoDB thành công"))
.catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// Import routes
const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);

app.listen(3000, () => console.log("🚀 Server chạy tại http://localhost:3000"));
