
const express = require("express");
const prisma = require("../config/prisma");
const authenticateToken = require("../middlewares/auth.middleware");

const router = express.Router();

// GET: Lấy danh sách sản phẩm
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany();

    return res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công",
      data: products
    });
  } catch (error) {
    console.error("Get products error:", error.message);

    return res.status(500).json({
      message: "Lỗi máy chủ khi lấy danh sách sản phẩm"
    });
  }
});

// GET: Lấy chi tiết một sản phẩm
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID sản phẩm không hợp lệ"
      });
    }

    const product = await prisma.product.findUnique({
      where: { pid: id }
    });

    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm"
      });
    }

    return res.status(200).json({
      message: "Lấy chi tiết sản phẩm thành công",
      data: product
    });
  } catch (error) {
    console.error("Get product error:", error.message);

    return res.status(500).json({
      message: "Lỗi máy chủ khi lấy sản phẩm"
    });
  }
});

// POST: Thêm sản phẩm (chỉ Admin)
router.post("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.roleid !== 1) {
      return res.status(403).json({
        message: "Bạn không có quyền thêm sản phẩm"
      });
    }

    const { pname, price, quantity } = req.body;
    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);

    if (
      typeof pname !== "string" ||
      !pname.trim() ||
      price === undefined ||
      quantity === undefined ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0 ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      return res.status(400).json({
        message: "Tên, giá và số lượng sản phẩm không hợp lệ"
      });
    }

    const product = await prisma.product.create({
      data: {
        pname: pname.trim(),
        price: parsedPrice,
        quantity: parsedQuantity
      }
    });

    return res.status(201).json({
      message: "Thêm sản phẩm thành công",
      data: product
    });
  } catch (error) {
    console.error("Create product error:", error.message);

    return res.status(500).json({
      message: "Lỗi máy chủ khi thêm sản phẩm"
    });
  }
});

// PUT: Cập nhật sản phẩm (chỉ Admin)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.roleid !== 1) {
      return res.status(403).json({
        message: "Bạn không có quyền sửa sản phẩm"
      });
    }

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID sản phẩm không hợp lệ"
      });
    }

    const { pname, price, quantity } = req.body;
    const data = {};

    if (pname !== undefined) {
      if (typeof pname !== "string" || !pname.trim()) {
        return res.status(400).json({
          message: "Tên sản phẩm không hợp lệ"
        });
      }
      data.pname = pname.trim();
    }

    if (price !== undefined) {
      const parsedPrice = Number(price);

      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          message: "Giá sản phẩm không hợp lệ"
        });
      }
      data.price = parsedPrice;
    }

    if (quantity !== undefined) {
      const parsedQuantity = Number(quantity);

      if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
        return res.status(400).json({
          message: "Số lượng sản phẩm không hợp lệ"
        });
      }
      data.quantity = parsedQuantity;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        message: "Vui lòng nhập ít nhất một trường cần cập nhật"
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { pid: id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm"
      });
    }

    const product = await prisma.product.update({
      where: { pid: id },
      data
    });

    return res.status(200).json({
      message: "Cập nhật sản phẩm thành công",
      data: product
    });
  } catch (error) {
    console.error("Update product error:", error.message);

    return res.status(500).json({
      message: "Lỗi máy chủ khi cập nhật sản phẩm"
    });
  }
});

// DELETE: Xóa sản phẩm (chỉ Admin)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.roleid !== 1) {
      return res.status(403).json({
        message: "Bạn không có quyền xóa sản phẩm"
      });
    }

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID sản phẩm không hợp lệ"
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { pid: id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm"
      });
    }

    await prisma.product.delete({
      where: { pid: id }
    });

    return res.status(200).json({
      message: "Xóa sản phẩm thành công"
    });
  } catch (error) {
    console.error("Delete product error:", error.message);

    return res.status(500).json({
      message: "Lỗi máy chủ khi xóa sản phẩm"
    });
  }
});

module.exports = router;
