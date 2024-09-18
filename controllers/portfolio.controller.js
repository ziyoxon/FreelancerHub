const { Sequelize } = require("sequelize");
const { errorHandler } = require("../helpers/error_handler");
const Portfolio = require("../models/portfolio.model");
const { portfolioValidation } = require("../validations/portfolio_validation");

const Freelancer = require("../models/freelancer.model");

const addNewPortfolio = async (req, res) => {
  try {
    // Kiritilgan ma'lumotlarni tekshirish
    const { error, value } = portfolioValidation(req.body);
    if (error) {
      return res.status(400).send({
        statusCode: 400,
        message: error.message,
      });
    }

    const { freelancerId, project_title, project_description, project_link } =
      value;

    // Mavjud loyihani tekshirish (title bo'yicha katta-kichik harflarni hisobga olmagan holda)
    const portfolio = await Portfolio.findOne({
      where: {
        project_title: {
          [Sequelize.Op.iLike]: `%${project_title}%`, // title bilan mos keladigan projektni tekshirish
        },
      },
    });

    if (portfolio) {
      return res.status(400).send({
        statusCode: 400,
        message: "Bunday portfolio mavjud",
      });
    }

    // Yangi projekt yaratish
    const newPortfolio = await Portfolio.create({
      freelancerId,
      project_title,
      project_description,
      project_link,
    });

    // Muvaffaqiyatli javob
    res.status(201).send({
      statusCode: 201,
      message: "New Portfolio added successfully",
      data: newPortfolio,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getAllPortfolios = async (req, res) => {
  try {
    // const decodedToken = jwt.verify(token, config.get("tokenKey"));
    // console.log(decodedToken);

    // Barcha loyihalarni olish
    const projects = await Portfolio.findAll({
      include: Freelancer,
    });

    // Loyihalar mavjudligini tekshirish
    if (!projects || projects.length === 0) {
      return res.status(404).send({
        statusCode: 404,
        message: "Portfolios not found",
      });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "All projects fetched successfully!",
      data: projects,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getPortfolioById = async (req, res) => {
  try {
    const { id } = req.params;

    // Loyihani ID orqali olish
    const portfolio = await Portfolio.findOne({
      include: Freelancer,
      where: { id },
    });
    if (!portfolio) {
      return res.status(404).send({
        statusCode: 404,
        message: "Portfolio not found",
      });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Portfolio found successfully",
      data: portfolio,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const updatePortfolioById = async (req, res) => {
  try {
    const { id } = req.params;

    // Loyihani ID orqali olish
    const check = await Portfolio.findByPk(id);
    if (!check) {
      return res.status(404).send({ message: "Portfolio not found" });
    }

    // Kiritilgan ma'lumotlarni tekshirish
    const { error, value } = portfolioValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const { freelancerId, project_title, project_description, project_link } =
      value;

    // Loyihani yangilash
    const [updateCount, updatedPortfolios] = await Portfolio.update(
      { freelancerId, project_title, project_description, project_link },
      { where: { id }, returning: true }
    );

    // Yangilangan loyiha mavjudligini tekshirish
    if (updateCount === 0) {
      return res.status(404).send({ message: "Portfolio not found" });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Updated portfolio by id successfully",
      data: updatedPortfolios[0], // Yangilangan loyiha ma'lumotlari
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const deletePortfolioById = async (req, res) => {
  try {
    const { id } = req.params;

    // Loyihani ID orqali olish
    const portfolio = await Portfolio.findByPk(id);
    if (!portfolio) {
      return res.status(404).send({ message: "Portfolio not found" });
    }

    // Loyihani o'chirish
    await Portfolio.destroy({ where: { id } });

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Deleted portfolio by id successfully",
      data: { id }, // O'chirilgan loyiha ID sini qaytarish
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

module.exports = {
  addNewPortfolio,
  getAllPortfolios,
  getPortfolioById,
  updatePortfolioById,
  deletePortfolioById,
};
