const bcrypt = require("bcrypt");
const config = require("config");
const uuid = require("uuid");
const { Sequelize, where } = require("sequelize");
const myJwt = require("../services/jwt_service");
const mail_service = require("../services/mail_service");
const Freelancer = require("../models/freelancer.model");
const { errorHandler } = require("../helpers/error_handler");
const { clientValidation } = require("../validations/client_validation");

const Partfolio = require("../models/portfolio.model");
const Skill = require("../models/skill.model");

const registerFreelancer = async (req, res) => {
  try {
    // Kiritilgan ma'lumotlarni tekshirish
    const { error, value } = clientValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }
    const {
      full_name,
      email,
      password,
      profile_image,
      rating,
      experiance_year,
      bio,
    } = value;

    // Mavjud emailni tekshirish
    const exists_email = await Freelancer.findOne({
      where: { email: { [Sequelize.Op.iRegexp]: email } }, // Sequelize uchun regex ishlatilgan
    });

    if (exists_email) {
      return res.status(400).send({ message: "Bu email mavjud" });
    }

    // Parolni hash qilish
    const hashedPassword = bcrypt.hashSync(password, 7);

    // Activation link generatsiya qilish
    const activation_link = uuid.v4();

    // Yangi klient yaratish
    const newFreelancer = await Freelancer.create({
      full_name,
      email,
      password: hashedPassword,
      profile_image,
      rating,
      experiance_year,
      bio,
      activation_link, // Activation linkni bazaga saqlab qo'yish mumkin
    });

    // Faollashtirish uchun email jo'natish
    await mail_service.sendActivationMail(
      email,
      `${config.get("api_url")}:${config.get(
        "PORT"
      )}/api/freelancer/activate/${activation_link}`
    );

    // Token yaratish
    const payLoad = {
      _id: newFreelancer.id,
      name: newFreelancer.full_name,
      email: newFreelancer.email,
    };
    const tokens = myJwt.generateTokens(payLoad);
    newFreelancer.token = tokens.refreshToken;
    await newFreelancer.save();

    // Refresh tokenni cookie'ga saqlash
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"), // maxage -> maxAge ga o'zgartirildi
    });

    // Muvaffaqiyatli javob qaytarish
    res.status(201).send({
      statusCode: 201,
      message: "New Freelancer added successfully",
      id: newFreelancer.id,
      accessToken: tokens.accessToken,
      data: newFreelancer,
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

// Login Freelancer
const loginFreelancer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Freelancerni email orqali qidirish
    const freelancer = await Freelancer.findOne({
      where: { email },
    });

    // Freelancer mavjudligini va parolni tekshirish
    if (!freelancer) {
      return res.status(400).send({
        statusCode: 400,
        message: "Incorrect email or password",
      });
    }

    const validPassword = bcrypt.compareSync(password, freelancer.password);
    if (!validPassword) {
      return res.status(400).send({
        statusCode: 400,
        message: "Incorrect email or password",
      });
    }

    // Payload yaratish
    const payLoad = {
      _id: freelancer.id,
      name: freelancer.full_name,
      email: freelancer.email,
      freelancer_roles: ["READ", "WRITE"], // Freelancerning rollari
    };

    // Tokenlarni yaratish
    const tokens = myJwt.generateTokens(payLoad);
    freelancer.token = tokens.refreshToken;
    (freelancer.is_active = true), await freelancer.save(); // Freelancer obyektini saqlash

    // Refresh tokenni cookie'ga saqlash
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"),
    });

    // Muvaffaqiyatli javob qaytarish
    res.status(200).send({
      statusCode: 200,
      message: "Freelancer logged in successfully",
      id: freelancer.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

// LogOut Freelancer
const logOutFreelancer = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    // Refresh tokenning mavjudligini tekshirish
    if (!refreshToken) {
      return res.status(403).send({
        statusCode: 403,
        message: "No refresh token provided",
      });
    }

    // Freelancerni refresh token orqali topish
    const freelancer = await Freelancer.findOne({
      where: { token: refreshToken },
    });

    // Freelancer mavjudligini va refresh token mosligini tekshirish
    if (!freelancer) {
      return res.status(400).send({
        statusCode: 400,
        message:
          "Invalid refresh token. Not authorized to access this resource",
      });
    }

    // Tokenni yangilash va uni bo'shatish
    freelancer.token = null;
    freelancer.is_active = false;
    await freelancer.save(); // Freelancer obyektini saqlash

    // Refresh tokenni cookie'dan olib tashlash
    res.clearCookie("refreshToken");

    // Muvaffaqiyatli javob qaytarish
    res.status(200).send({
      statusCode: 200,
      message: "Freelancer logged out successfully",
      data: {
        id: freelancer.id,
        refreshToken: freelancer.token,
      },
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

// Refresh token
const refreshTokenFreelancer = async (req, res) => {
  try {
    // Cookie ichida refresh token mavjudligini tekshirish
    const { refreshToken } = req.cookies;

    // Token mavjudligini tekshirish
    if (!refreshToken) {
      return res.status(403).send({
        statusCode: 403,
        message: "Freelancer: No refresh token provided",
      });
    }

    // Refresh tokenni tekshirish
    let decodedRefreshToken;
    try {
      decodedRefreshToken = myJwt.verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(403).send({
        statusCode: 403,
        message: "Freelancer: Refresh token is not valid",
        error: error.message,
      });
    }

    // Freelancerni refresh token orqali topish
    const freelancerFromDB = await Freelancer.findOne({
      where: { token: refreshToken },
    });

    if (!freelancerFromDB) {
      return res.status(403).send({
        statusCode: 403,
        message:
          "Freelancer: Invalid refresh token. Not authorized to access this resource",
      });
    }

    // Yangi tokenlar yaratish
    const payLoad = {
      _id: freelancerFromDB.id,
      name: freelancerFromDB.full_name,
      email: freelancerFromDB.email,
    };

    const tokens = myJwt.generateTokens(payLoad);
    freelancerFromDB.token = tokens.refreshToken;
    await freelancerFromDB.save();

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
      message: "Freelancer refreshed successfully",
      id: freelancerFromDB.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

const getAllFreelancers = async (req, res) => {
  try {
    // const decodedToken = jwt.verify(token, config.get("tokenKey"));
    // console.log(decodedToken);

    const clients = await Freelancer.findAll({
      include: [
        { model: Partfolio, attributes: ["project_title"] },
        { model: Skill },
      ],
    });
    if (clients.length === 0) {
      return res.status(404).send({ message: "Freelancers not found" });
    }
    res.status(200).send({
      statusCode: 200,
      message: "All clients fetched successfully!",
      data: clients,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getFreelancerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Mijozni ID orqali olish
    const freelancer = await Freelancer.findOne({
      where: { id }, // ID bo'yicha topish
      // include: [
      //   { model: Partfolio, attributes: ["project_title"] },
      //   { model: Skill },
      // ],
    });
    if (!freelancer) {
      return res.status(404).send({ message: "Freelancer not found" });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Find freelancer by id successfully",
      data: freelancer,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const updateFreelancerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Mijozni ID orqali olish
    const check = await Freelancer.findByPk(id);
    if (!check) {
      return res.status(404).send({ message: "Freelancer not found" });
    }

    // Kiritilgan ma'lumotlarni tekshirish
    const { error, value } = clientValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const {
      full_name,
      email,
      password,
      profile_image,
      rating,
      experiance_year,
      bio,
    } = value;

    // Parolni hash qilish (agar parol mavjud bo'lsa)
    let hashedPassword = check.password; // mavjud parol saqlanadi
    if (password) {
      hashedPassword = bcrypt.hashSync(password, 7); // yangilangan parol hash qilinadi
    }

    // Mijoz ma'lumotlarini yangilash
    const [updateCount, updatedFreelancers] = await Freelancer.update(
      {
        full_name,
        email,
        password: hashedPassword,
        profile_image,
        rating,
        experiance_year,
        bio,
      },
      { where: { id }, returning: true }
    );

    // Yangilangan mijoz mavjudligini tekshirish
    if (updateCount === 0) {
      return res.status(404).send({ message: "Freelancer not found" });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Updated freelancer by id successfully",
      data: updatedFreelancers[0], // Yangilangan mijoz ma'lumotlari
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

const deleteFreelancerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Freelancerni ID orqali olish
    const freelancer = await Freelancer.findByPk(id);
    if (!freelancer) {
      return res.status(404).send({ message: "Freelancer not found" });
    }

    // Freelancerni o'chirish
    await Freelancer.destroy({ where: { id } });

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Deleted freelancer by id successfully",
      data: { id }, // O'chirilgan clientning ID sini qaytarish mumkin
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

const freelancerActivate = async (req, res) => {
  try {
    const { link } = req.params;

    // Freelancerni activation_link orqali topish
    const freelancer = await Freelancer.findOne({
      where: { activation_link: link },
    });

    // freelancer mavjudligini tekshirish
    if (!freelancer) {
      return res.status(404).send({
        statusCode: 404,
        message: "freelancer not found",
      });
    }

    // freelancer faolligi tekshiriladi
    if (freelancer.is_active) {
      return res.status(400).send({
        statusCode: 400,
        message: "freelancer is already active",
      });
    }

    // Freelancerni faollashtirish
    freelancer.is_active = true;
    freelancer.activation_link = ""; // Activation linkni bo‘shatish (ixtiyoriy)
    await freelancer.save();

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "freelancer activated successfully",
      is_active: freelancer.is_active,
      data: freelancer,
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

module.exports = {
  registerFreelancer,
  loginFreelancer,
  logOutFreelancer,
  refreshTokenFreelancer,
  getAllFreelancers,
  getFreelancerById,
  updateFreelancerById,
  deleteFreelancerById,
  freelancerActivate,
};
