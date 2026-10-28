require("dotenv").config();

const bcrypt = require("bcryptjs");
const prisma = require("./config/prisma");

async function main() {
  const username = "admin_test";
  const password = "Admin123456";

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { username }
  });

  if (existingUser) {
    console.log("Tài khoản admin_test đã tồn tại.");
    return;
  }

  const admin = await prisma.user.create({
    data: {
      username,
      fullname: "Admin Test",
      password: hashedPassword,
      roleid: 1,
      mid: 1
    },
    select: {
      uid: true,
      username: true,
      roleid: true
    }
  });

  console.log("Tạo Admin thành công:", admin);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });