const { Sequelize } = require("sequelize");
const { errorHandler } = require("../helpers/error_handler");
const Contract = require("../models/contract.model");
const { contractValidation } = require("../validations/contract_validation");

const Freelancer = require("../models/freelancer.model");
const Project = require("../models/project.model");

const addNewContract = async (req, res) => {
  try {
    // Kiritilgan ma'lumotlarni tekshirish
    const { error, value } = contractValidation(req.body);
    if (error) {
      return res.status(400).send({
        statusCode: 400,
        message: error.message,
      });
    }

    const { projectId, freelancerId, expired_date, status } = value;

    // Mavjud kontraktni tekshirish (masalan, project_id va freelancer_id bo'yicha)
    const contract = await Contract.findOne({
      where: {
        projectId,
        freelancerId,
      },
    });

    if (contract) {
      return res.status(400).send({
        statusCode: 400,
        message: "Bunday contract mavjud",
      });
    }

    // Yangi kontrakt yaratish
    const newContract = await Contract.create({
      projectId,
      freelancerId,
      expired_date,
      status,
    });

    // Muvaffaqiyatli javob
    res.status(201).send({
      statusCode: 201,
      message: "New Contract added successfully",
      data: newContract,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getAllContracts = async (req, res) => {
  try {
    // const decodedToken = jwt.verify(token, config.get("tokenKey"));
    // console.log(decodedToken);

    // Barcha loyihalarni olish
    const projects = await Contract.findAll({
      include: [{ model: Freelancer }, { model: Project }],
    });

    // Loyihalar mavjudligini tekshirish
    if (!projects || projects.length === 0) {
      return res.status(404).send({
        statusCode: 404,
        message: "Contracts not found",
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

const getContractById = async (req, res) => {
  try {
    const { id } = req.params;

    // Loyihani ID orqali olish
    const contract = await Contract.findOne({
      include: [{ model: Freelancer }, { model: Project }],
      where: { id },
    });
    if (!contract) {
      return res.status(404).send({
        statusCode: 404,
        message: "Contract not found",
      });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Contract found successfully",
      data: contract,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const updateContractById = async (req, res) => {
  try {
    const { id } = req.params;

    // Loyihani ID orqali olish
    const check = await Contract.findByPk(id);
    if (!check) {
      return res.status(404).send({ message: "Contract not found" });
    }

    // Kiritilgan ma'lumotlarni tekshirish
    const { error, value } = contractValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const { projectId, freelancerId, expired_date, status } = value;

    // Loyihani yangilash
    const [updateCount, updatedContracts] = await Contract.update(
      { projectId, freelancerId, expired_date, status },
      { where: { id }, returning: true }
    );

    // Yangilangan loyiha mavjudligini tekshirish
    if (updateCount === 0) {
      return res.status(404).send({ message: "Contract not found" });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Updated contract by id successfully",
      data: updatedContracts[0], // Yangilangan loyiha ma'lumotlari
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const deleteContractById = async (req, res) => {
  try {
    const { id } = req.params;

    // Loyihani ID orqali olish
    const contract = await Contract.findByPk(id);
    if (!contract) {
      return res.status(404).send({ message: "Contract not found" });
    }

    // Loyihani o'chirish
    await Contract.destroy({ where: { id } });

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Deleted contract by id successfully",
      data: { id }, // O'chirilgan loyiha ID sini qaytarish
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

module.exports = {
  addNewContract,
  getAllContracts,
  getContractById,
  updateContractById,
  deleteContractById,
};
