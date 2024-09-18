const { Sequelize } = require("sequelize");
const { errorHandler } = require("../helpers/error_handler");
const Project = require("../models/project.model");
const { projectValidation } = require("../validations/project_validation");

const Client = require("../models/client.model");

const addNewProject = async (req, res) => {
  try {
    // Kiritilgan ma'lumotlarni tekshirish
    const { error, value } = projectValidation(req.body);
    if (error) {
      return res.status(400).send({
        statusCode: 400,
        message: error.message,
      });
    }

    const { clientId, title, description, budget } = value;

    // Mavjud projectni tekshirish (title bo'yicha katta-kichik harflarni hisobga olmagan holda)
    const project = await Project.findOne({
      where: {
        title: {
          [Sequelize.Op.iLike]: `%${title}%`, // title bilan mos keladigan projektni tekshirish
        },
      },
    });

    if (project) {
      return res.status(400).send({
        statusCode: 400,
        message: "Bunday project mavjud",
      });
    }

    // Yangi projekt yaratish
    const newProject = await Project.create({
      clientId,
      title,
      description,
      budget,
    });

    // Muvaffaqiyatli javob
    res.status(201).send({
      statusCode: 201,
      message: "New Project added successfully",
      data: newProject, // date o'rniga data ishlatildi
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getAllProjects = async (req, res) => {
  try {
    // const decodedToken = jwt.verify(token, config.get("tokenKey"));
    // console.log(decodedToken);

    // Barcha loyihalarni olish
    const projects = await Project.findAll({
      include: Client,
    });

    // Loyihalar mavjudligini tekshirish
    if (!projects || projects.length === 0) {
      return res.status(404).send({
        statusCode: 404,
        message: "Projects not found",
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

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    // Loyihani ID orqali olish
    const project = await Project.findOne({
      include: Client,
      where: { id },
    });
    if (!project) {
      return res.status(404).send({
        statusCode: 404,
        message: "Project not found",
      });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Project found successfully",
      data: project,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const updateProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    // Loyihani ID orqali olish
    const check = await Project.findByPk(id);
    if (!check) {
      return res.status(404).send({ message: "Project not found" });
    }

    // Kiritilgan ma'lumotlarni tekshirish
    const { error, value } = projectValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const { clientId, title, description, budget } = value;

    // Loyihani yangilash
    const [updateCount, updatedProjects] = await Project.update(
      { clientId, title, description, budget },
      { where: { id }, returning: true }
    );

    // Yangilangan loyiha mavjudligini tekshirish
    if (updateCount === 0) {
      return res.status(404).send({ message: "Project not found" });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Updated project by id successfully",
      data: updatedProjects[0], // Yangilangan loyiha ma'lumotlari
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const deleteProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    // Loyihani ID orqali olish
    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }

    // Loyihani o'chirish
    await Project.destroy({ where: { id } });

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Deleted project by id successfully",
      data: { id }, // O'chirilgan loyiha ID sini qaytarish
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};


module.exports = {
  addNewProject,
  getAllProjects,
  getProjectById,
  updateProjectById,
  deleteProjectById,
};
