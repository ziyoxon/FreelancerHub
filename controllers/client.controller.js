const bcrypt = require("bcrypt");
const config = require("config");
const uuid = require("uuid");
const { Sequelize } = require("sequelize");
const myJwt = require("../services/jwt_service");
const mail_service = require("../services/mail_service");
const Client = require("../models/client.model");
const { errorHandler } = require("../helpers/error_handler");
const { clientValidation } = require("../validations/client_validation");
const Project = require("../models/project.model");

const registerClient = async (req, res) => {
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
      company_name,
      profile_image,
      registration_date,
    } = value;

    // Mavjud emailni tekshirish
    const exists_email = await Client.findOne({
      where: { email: { [Sequelize.Op.iLike]: email } }, // Sequelize uchun iLike operatori
    });

    if (exists_email) {
      return res.status(400).send({ message: "Bu email mavjud" });
    }

    // Parolni hash qilish
    const hashedPassword = bcrypt.hashSync(password, 7);

    // Activation link generatsiya qilish
    const activation_link = uuid.v4();

    // Yangi klient yaratish
    const newClient = await Client.create({
      full_name,
      email,
      password: hashedPassword,
      company_name,
      profile_image,
      registration_date,
      activation_link, // Activation linkni bazaga saqlab qo'yish mumkin
    });

    // Faollashtirish uchun email jo'natish
    await mail_service.sendActivationMail(
      email,
      `${config.get("api_url")}:${config.get(
        "PORT"
      )}/api/client/activate/${activation_link}`
    );

    // Token yaratish
    const payLoad = {
      _id: newClient.id,
      name: newClient.full_name,
      email: newClient.email,
    };
    const tokens = myJwt.generateTokens(payLoad);
    newClient.token = tokens.refreshToken;
    await newClient.save();

    // Refresh tokenni cookie'ga saqlash
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"),
    });

    // Muvaffaqiyatli javob qaytarish
    res.status(201).send({
      statusCode: 201,
      message: "New Client added successfully",
      id: newClient.id,
      accessToken: tokens.accessToken,
      data: newClient,
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

// Login Client
const loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Clientni email orqali qidirish
    const client = await Client.findOne({
      where: { email },
    });

    // Client mavjudligini va parolni tekshirish
    if (!client) {
      return res.status(400).send({
        statusCode: 400,
        message: "Incorrect email or password",
      });
    }

    const validPassword = bcrypt.compareSync(password, client.password);
    if (!validPassword) {
      return res.status(400).send({
        statusCode: 400,
        message: "Incorrect email or password",
      });
    }

    // Payload yaratish
    const payLoad = {
      _id: client.id,
      name: client.full_name,
      email: client.email,
      client_roles: ["READ", "WRITE"], // Clientning rollari
    };

    // Tokenlarni yaratish
    const tokens = myJwt.generateTokens(payLoad);
    client.token = tokens.refreshToken;
    client.is_active = true;
    await client.save(); // Client obyektini saqlash

    // Refresh tokenni cookie'ga saqlash
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"),
    });

    // Muvaffaqiyatli javob qaytarish
    res.status(200).send({
      statusCode: 200,
      message: "Client logged in successfully",
      id: client.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

// LogOut Client
const logOutClient = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    // Refresh tokenning mavjudligini tekshirish
    if (!refreshToken) {
      return res.status(403).send({
        statusCode: 403,
        message: "No refresh token provided",
      });
    }

    // Clientni refresh token orqali topish
    const client = await Client.findOne({
      where: { token: refreshToken },
    });

    // Client mavjudligini va refresh token mosligini tekshirish
    if (!client) {
      return res.status(400).send({
        statusCode: 400,
        message:
          "Invalid refresh token. Not authorized to access this resource",
      });
    }

    // Tokenni yangilash va uni bo'shatish
    client.token = null;
    client.is_active = false;
    await client.save(); // Client obyektini saqlash

    // Refresh tokenni cookie'dan olib tashlash
    res.clearCookie("refreshToken");

    // Muvaffaqiyatli javob qaytarish
    res.status(200).send({
      statusCode: 200,
      message: "Client logged out successfully",
      data: {
        id: client.id,
        refreshToken: client.token,
      },
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

// Refresh token
const refreshTokenClient = async (req, res) => {
  try {
    // Cookie ichida refresh token mavjudligini tekshirish
    const { refreshToken } = req.cookies;

    // Token mavjudligini tekshirish
    if (!refreshToken) {
      return res.status(403).send({
        statusCode: 403,
        message: "Client: No refresh token provided",
      });
    }

    // Refresh tokenni tekshirish
    let decodedRefreshToken;
    try {
      decodedRefreshToken = myJwt.verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(403).send({
        statusCode: 403,
        message: "Client: Refresh token is not valid",
        error: error.message,
      });
    }

    // Clientni refresh token orqali topish
    const clinetFromDB = await Client.findOne({
      where: { token: refreshToken },
    });

    if (!clinetFromDB) {
      return res.status(403).send({
        statusCode: 403,
        message:
          "Client: Invalid refresh token. Not authorized to access this resource",
      });
    }

    // Yangi tokenlar yaratish
    const payLoad = {
      _id: clinetFromDB.id,
      name: clinetFromDB.full_name,
      email: clinetFromDB.email,
    };

    const tokens = myJwt.generateTokens(payLoad);
    clinetFromDB.token = tokens.refreshToken;
    await clinetFromDB.save();

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
      message: "Client refreshed successfully",
      id: clinetFromDB.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

const getAllClients = async (req, res) => {
  try {
    // const decodedToken = jwt.verify(token, config.get("tokenKey"));
    // console.log(decodedToken);

    const clients = await Client.findAll({
      include: { model: Project, attributes: ["title"] },
    });
    if (clients.length === 0) {
      return res.status(404).send({ message: "Clients not found" });
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

const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    // Mijozni ID orqali olish
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).send({ message: "Client not found" });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Find client by id successfully",
      data: client,
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

const updateClientById = async (req, res) => {
  try {
    const { id } = req.params;

    // Mijozni ID orqali olish
    const check = await Client.findByPk(id);
    if (!check) {
      return res.status(404).send({ message: "Client not found" });
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
      company_name,
      profile_image,
      registration_date,
    } = value;

    // Parolni hash qilish (agar parol mavjud bo'lsa)
    let hashedPassword = check.password; // mavjud parol saqlanadi
    if (password) {
      hashedPassword = bcrypt.hashSync(password, 7); // yangilangan parol hash qilinadi
    }

    // Mijoz ma'lumotlarini yangilash
    const [updateCount, updatedClients] = await Client.update(
      {
        full_name,
        email,
        password: hashedPassword,
        company_name,
        profile_image,
        registration_date,
      },
      { where: { id }, returning: true }
    );

    // Yangilangan mijoz mavjudligini tekshirish
    if (updateCount === 0) {
      return res.status(404).send({ message: "Client not found" });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Updated client by id successfully",
      data: updatedClients[0], // Yangilangan mijoz ma'lumotlari
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

const deleteClientById = async (req, res) => {
  try {
    const { id } = req.params;

    // Clientni ID orqali olish
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).send({ message: "Client not found" });
    }

    // Clientni o'chirish
    await Client.destroy({ where: { id } });

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Deleted client by id successfully",
      data: { id }, // O'chirilgan clientning ID sini qaytarish mumkin
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

const clientActivate = async (req, res) => {
  try {
    const { link } = req.params;

    // Clientni activation_link orqali topish
    const client = await Client.findOne({
      where: { activation_link: link },
    });

    // client mavjudligini tekshirish
    if (!client) {
      return res.status(404).send({
        statusCode: 404,
        message: "client not found",
      });
    }

    // client faolligi tekshiriladi
    if (client.is_active) {
      return res.status(400).send({
        statusCode: 400,
        message: "client is already active",
      });
    }

    // Clientni faollashtirish
    client.is_active = true;
    client.activation_link = ""; // Activation linkni bo‘shatish (ixtiyoriy)
    await client.save();

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "client activated successfully",
      is_active: client.is_active,
      data: client,
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

module.exports = {
  registerClient,
  getAllClients,
  getClientById,
  updateClientById,
  deleteClientById,
  loginClient,
  logOutClient,
  refreshTokenClient,
  clientActivate,
};
