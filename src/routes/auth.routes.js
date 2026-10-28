const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const router = express.Router();

// API đăng ký
router.post("/register", async (req, res) => {
  try {
    const { username, fullname, password } = req.body;

    if (!username || !fullname || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập username, fullname và password"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 6 ký tự"
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Tên đăng nhập đã tồn tại"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        fullname,
        password: hashedPassword,
        roleid: 2,
        mid: 1
      },
      select: {
        uid: true,
        username: true,
        fullname: true,
        roleid: true,
        mid: true
      }
    });

    return res.status(201).json({
      message: "Đăng ký thành công",
      user
    });
  } catch (error) {
    console.error("Register error:", error.message);

    return res.status(500).json({
      message: "Lỗi máy chủ khi đăng ký"
    });
  }
});

// API đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập username và password"
      });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({
        message: "Tên đăng nhập hoặc mật khẩu không đúng"
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Tên đăng nhập hoặc mật khẩu không đúng"
      });
    }

    const token = jwt.sign(
      {
        uid: user.uid,
        roleid: user.roleid
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
      }
    );

    return res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        uid: user.uid,
        username: user.username,
        fullname: user.fullname,
        roleid: user.roleid,
        mid: user.mid
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Lỗi máy chủ khi đăng nhập"
    });
  }
});

module.exports = router;