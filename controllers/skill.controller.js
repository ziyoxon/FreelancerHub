const { Sequelize } = require("sequelize");
const { errorHandler } = require("../helpers/error_handler");
const Skill = require("../models/skill.model");
const { skillValidation } = require("../validations/skill_validation");

const addNewSkill = async (req, res) => {
  try {
    // Kiritilgan ma'lumotlarni tekshirish
    const { error, value } = skillValidation(req.body);
    if (error) {
      return res.status(400).send({
        statusCode: 400,
        message: error.message,
      });
    }

    const { skill_name } = value;

    // Mavjud projectni tekshirish (skill_name bo'yicha katta-kichik harflarni hisobga olmagan holda)
    const skill = await Skill.findOne({
      where: {
        skill_name: {
          [Sequelize.Op.iLike]: `%${skill_name}%`, // skill_name bilan mos keladigan projektni tekshirish
        },
      },
    });

    if (skill) {
      return res.status(400).send({
        statusCode: 400,
        message: "Bunday skill mavjud",
      });
    }

    // Yangi projekt yaratish
    const newSkill = await Skill.create({
      skill_name,
    });

    // Muvaffaqiyatli javob
    res.status(201).send({
      statusCode: 201,
      message: "New Skill added successfully",
      data: newSkill, // date o'rniga data ishlatildi
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getAllSkills = async (req, res) => {
  try {
    // const decodedToken = jwt.verify(token, config.get("tokenKey"));
    // console.log(decodedToken);

    // Barcha loyihalarni olish
    const skills = await Skill.findAll();

    // Loyihalar mavjudligini tekshirish
    if (!skills || skills.length === 0) {
      return res.status(404).send({
        statusCode: 404,
        message: "Skills not found",
      });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "All skills fetched successfully!",
      data: skills,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getSkillById = async (req, res) => {
  try {
    const { id } = req.params;

    // Loyihani ID orqali olish
    const skill = await Skill.findOne({
      where: { id },
    });
    if (!skill) {
      return res.status(404).send({
        statusCode: 404,
        message: "Skill not found",
      });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Skill found successfully",
      data: skill,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const updateSkillById = async (req, res) => {
  try {
    const { id } = req.params;

    // Loyihani ID orqali olish
    const check = await Skill.findByPk(id);
    if (!check) {
      return res.status(404).send({ message: "Skill not found" });
    }

    // Kiritilgan ma'lumotlarni tekshirish
    const { error, value } = skillValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const { skill_name } = value;

    // Loyihani yangilash
    const [updateCount, updatedSkills] = await Skill.update(
      { skill_name },
      { where: { id }, returning: true }
    );

    // Yangilangan loyiha mavjudligini tekshirish
    if (updateCount === 0) {
      return res.status(404).send({ message: "Skill not found" });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Updated skill by id successfully",
      data: updatedSkills[0], // Yangilangan loyiha ma'lumotlari
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const deleteSkillById = async (req, res) => {
  try {
    const { id } = req.params;

    // Loyihani ID orqali olish
    const skill = await Skill.findByPk(id);
    if (!skill) {
      return res.status(404).send({ message: "Skill not found" });
    }

    // Loyihani o'chirish
    await Skill.destroy({ where: { id } });

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Deleted skill by id successfully",
      data: { id }, // O'chirilgan loyiha ID sini qaytarish
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

module.exports = {
  addNewSkill,
  getAllSkills,
  getSkillById,
  updateSkillById,
  deleteSkillById,
};
