
require("dotenv").config();

const productRoutes = require("./routes/product.routes");
const authenticateToken = require("./middlewares/auth.middleware");
const express = require("express");
const prisma = require("./config/prisma");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(express.json());

// API đăng ký và đăng nhập
app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);

// Health check
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "healthy",
      message: "API and database are working",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health check failed:", error.message);

    res.status(503).json({
      status: "unhealthy",
      message: "Database connection failed",
      database: "disconnected"
    });
  }
});

// Trang chủ
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Ecommerce MVP API"
  });
});

const PORT = process.env.PORT || 3000;

app.get("/api/auth/me", authenticateToken, (req, res) => {
  res.status(200).json({
    message: "Xác thực thành công",
    user: req.user
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
