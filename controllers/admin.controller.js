const bcrypt = require("bcrypt");
const config = require("config");
const uuid = require("uuid");
const adminJwt = require("../services/admin_jwt_service");
const Admin = require("../models/admin.model");
const { errorHandler } = require("../helpers/error_handler");
const { adminValidation } = require("../validations/admin_validation");

const registerAdmin = async (req, res) => {
  try {
    // Kiritilgan ma'lumotlarni tekshirish
    const { error, value } = adminValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const { full_name, login, password, is_active, is_creator } = value;

    // Admin login mavjudligini tekshirish
    const existingAdmin = await Admin.findOne({ where: { login } });
    if (existingAdmin) {
      return res.status(400).send({ message: "This login is already taken" });
    }

    // Parolni hash qilish
    const hashedPassword = bcrypt.hashSync(password, 7);

    // Activation link generatsiya qilish
    const activation_link = uuid.v4();

    // Yangi admin yaratish
    const newAdmin = await Admin.create({
      full_name,
      login,
      password: hashedPassword,
      is_active,
      is_creator,
      activation_link, // Activation linkni bazaga saqlab qo'yish mumkin
    });

    // Token yaratish
    const payLoad = {
      _id: newAdmin.id,
      name: newAdmin.full_name,
      login: newAdmin.login,
      is_creator: newAdmin.is_creator,
    };
    const tokens = adminJwt.generateTokens(payLoad);
    newAdmin.token = tokens.refreshToken;
    await newAdmin.save();

    // Refresh tokenni cookie'ga saqlash
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"), // maxAge noto'g'ri yozilgan
    });

    // Muvaffaqiyatli javob qaytarish
    res.status(201).send({
      statusCode: 201,
      message: "New Admin added successfully",
      id: newAdmin.id,
      accessToken: tokens.accessToken,
      data: newAdmin,
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

// login Admin
const loginAdmin = async (req, res) => {
  try {
    const { login, password } = req.body;

    // Adminni login orqali qidirish
    const admin = await Admin.findOne({
      where: { login },
    });

    // Admin mavjudligini va parolni tekshirish
    if (!admin) {
      return res.status(400).send({
        statusCode: 400,
        message: "Incorrect login or password",
      });
    }

    const validPassword = bcrypt.compareSync(password, admin.password);
    if (!validPassword) {
      return res.status(400).send({
        statusCode: 400,
        message: "Incorrect login or password",
      });
    }

    // Payload yaratish
    const payLoad = {
      _id: admin.id,
      name: admin.full_name,
      login: admin.login,
      is_creator: admin.is_creator,
      admin_roles: ["READ", "WRITE"], // Adminning rollari
    };

    // Tokenlarni yaratish
    const tokens = adminJwt.generateTokens(payLoad);
    admin.token = tokens.refreshToken;
    (admin.is_active = true), await admin.save(); // Admin obyektini saqlash

    // Refresh tokenni cookie'ga saqlash
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"),
    });

    // Muvaffaqiyatli javob qaytarish
    res.status(200).send({
      statusCode: 200,
      message: "Admin logged in successfully",
      id: admin.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

// LogOut Admin
const logOutAdmin = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    // Refresh tokenning mavjudligini tekshirish
    if (!refreshToken) {
      return res.status(403).send({
        statusCode: 403,
        message: "No refresh token provided",
      });
    }

    // Adminni refresh token orqali topish
    const admin = await Admin.findOne({
      where: { token: refreshToken },
    });

    // Admin mavjudligini va refresh token mosligini tekshirish
    if (!admin) {
      return res.status(400).send({
        statusCode: 400,
        message:
          "Invalid refresh token. Not authorized to access this resource",
      });
    }

    // Tokenni yangilash va uni bo'shatish
    admin.token = null;
    admin.is_active = false;
    await admin.save(); // Admin obyektini saqlash

    // Refresh tokenni cookie'dan olib tashlash
    res.clearCookie("refreshToken");

    // Muvaffaqiyatli javob qaytarish
    res.status(200).send({
      statusCode: 200,
      message: "Admin logged out successfully",
      data: {
        id: admin.id,
        refreshToken: admin.token,
      },
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

// Refresh token
const refreshTokenAdmin = async (req, res) => {
  try {
    // Cookie ichida refresh token mavjudligini tekshirish
    const { refreshToken } = req.cookies;

    // Token mavjudligini tekshirish
    if (!refreshToken) {
      return res.status(403).send({
        statusCode: 403,
        message: "Admin: No refresh token provided",
      });
    }

    // Refresh tokenni tekshirish
    let decodedRefreshToken;
    try {
      decodedRefreshToken = adminJwt.verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(403).send({
        statusCode: 403,
        message: "Admin: Refresh token is not valid",
        error: error.message,
      });
    }

    // Adminni refresh token orqali topish
    const adminFromBD = await Admin.findOne({
      where: { token: refreshToken },
    });

    if (!adminFromBD) {
      return res.status(403).send({
        statusCode: 403,
        message:
          "Admin: Invalid refresh token. Not authorized to access this resource",
      });
    }

    // Yangi tokenlar yaratish
    const payLoad = {
      _id: adminFromBD.id,
      name: adminFromBD.full_name,
      login: adminFromBD.login,
      is_creator: adminFromBD.is_creator,
    };

    const tokens = adminJwt.generateTokens(payLoad);
    adminFromBD.token = tokens.refreshToken;
    await adminFromBD.save();

    // Yangi refresh tokenni cookie'ga saqlash
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      // secure: true, // Faqat HTTPS orqali jo‘natiladi
      // sameSite: "Strict", // Xoch sayt hujumlarini oldini olish uchun
      maxAge: config.get("refresh_time_ms"),
    });

    // Muvaffaqiyatli javob qaytarish
    res.status(200).send({
      statusCode: 200,
      message: "Admin refreshed successfully",
      id: adminFromBD.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

const getAllAdmins = async (req, res) => {
  try {
    // const decodedToken = jwt.verify(token, config.get("tokenKey"));
    // console.log(decodedToken);

    // Barcha adminlarni olish
    const admins = await Admin.findAll();

    // Adminlar mavjudligini tekshirish
    if (!admins || admins.length === 0) {
      return res.status(404).send({ message: "Admins not found" });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "All admins fetched successfully!",
      data: admins,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    // Mijozni ID orqali olish
    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).send({ message: "Admin not found" });
    }

    // Ruxsatni tekshirish - req.admin mavjudligini va id maydonini tekshirish
    // if (!req.admin || !req.admin.id || req.admin.id.toString() !== id) {
    //   return res.status(403).send({
    //     statusCode: 403,
    //     message: "Ruxsat etilmagan foydalanuvchi. Unauthorized access",
    //   });
    // }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Find admin by id successfully",
      data: admin,
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

const updateAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    // Mijozni ID orqali olish
    const check = await Admin.findByPk(id);
    if (!check) {
      return res.status(404).send({ message: "Admin not found" });
    }

    // Kiritilgan ma'lumotlarni tekshirish
    const { error, value } = adminValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const { full_name, login, password, is_active, is_creator } = value;

    // Parolni hash qilish (agar parol mavjud bo'lsa)
    let hashedPassword = check.password; // mavjud parol saqlanadi
    if (password) {
      hashedPassword = bcrypt.hashSync(password, 7); // yangilangan parol hash qilinadi
    }

    // Mijoz ma'lumotlarini yangilash
    const [updateCount, updatedAdmins] = await Admin.update(
      { full_name, login, password: hashedPassword, is_active, is_creator },
      { where: { id }, returning: true }
    );

    // Yangilangan mijoz mavjudligini tekshirish
    if (updateCount === 0) {
      return res.status(404).send({ message: "Admin not found" });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Updated admin by id successfully",
      data: updatedAdmins[0], // Yangilangan mijoz ma'lumotlari
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

const deleteAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    // Adminni ID orqali olish
    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).send({ message: "Admin not found" });
    }

    // Adminni o'chirish
    await Admin.destroy({ where: { id } });

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Deleted admin by id successfully",
      data: { id }, // O'chirilgan adminning ID sini qaytarish mumkin
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

const adminActivate = async (req, res) => {
  try {
    const { link } = req.params;

    // Adminni activation_link orqali topish
    const admin = await Admin.findOne({
      where: { activation_link: link },
    });

    // Admin mavjudligini tekshirish
    if (!admin) {
      return res.status(404).send({
        statusCode: 404,
        message: "Admin not found",
      });
    }

    // Admin faolligi tekshiriladi
    if (admin.is_active) {
      return res.status(400).send({
        statusCode: 400,
        message: "Admin is already active",
      });
    }

    // Adminni faollashtirish
    admin.is_active = true;
    admin.activation_link = ""; // Activation linkni bo‘shatish (ixtiyoriy)
    await admin.save();

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Admin activated successfully",
      is_active: admin.is_active,
      data: admin,
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  logOutAdmin,
  refreshTokenAdmin,
  getAllAdmins,
  getAdminById,
  updateAdminById,
  deleteAdminById,
  adminActivate,
  adminActivate,
};
