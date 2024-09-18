const { errorHandler } = require("../helpers/error_handler");
const Freelancer_skills = require("../models/freelancer_skills.model");
const {
  freelanserSkillsValidation,
} = require("../validations/freelancer_skills_validation");

const Freelancer = require("../models/freelancer.model");
const Skill = require("../models/skill.model");

const addNewFreelancerSkills = async (req, res) => {
  try {
    // Kiritilgan ma'lumotlarni tekshirish
    const { error, value } = freelanserSkillsValidation(req.body);
    if (error) {
      return res.status(400).send({
        statusCode: 400,
        message: error.message,
      });
    }

    const { freelancerId, skillId } = value;

    // Mavjud skillni tekshirish (masalan, freelancer_id va skill_id bo'yicha)
    const freelskill = await Freelancer_skills.findOne({
      where: {
        freelancerId,
        skillId,
      },
    });

    if (freelskill) {
      return res.status(400).send({
        statusCode: 400,
        message: "Bunday freelancer skills mavjud",
      });
    }

    // Yangi projekt yaratish
    const newFreeSkill = await Freelancer_skills.create({
      freelancerId,
      skillId,
    });

    // Muvaffaqiyatli javob
    res.status(201).send({
      statusCode: 201,
      message: "New Freelancer skills added successfully",
      data: newFreeSkill,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getAllFreelancerSkillss = async (req, res) => {
  try {
    // const decodedToken = jwt.verify(token, config.get("tokenKey"));
    // console.log(decodedToken);

    // Barcha loyihalarni olish
    const freelSkills = await Freelancer_skills.findAll({
      include: [
        { model: Freelancer, attributes: ["full_name"] },
        { model: Skill, attributes: ["skill_name"] },
      ],
    });

    // Loyihalar mavjudligini tekshirish
    if (!freelSkills || freelSkills.length === 0) {
      return res.status(404).send({
        statusCode: 404,
        message: "Freelancer_skillss not found",
      });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "All freelancer skills fetched successfully!",
      data: freelSkills,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getFreelancerSkillsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Loyihani ID orqali olish
    const freelSkill = await Freelancer_skills.findByPk(id);
    if (!freelSkill) {
      return res.status(404).send({
        statusCode: 404,
        message: "Freelancer skills not found",
      });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Freelancer skills found successfully",
      data: freelSkill,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const updateFreelancerSkillsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Loyihani ID orqali olish
    const check = await Freelancer_skills.findByPk(id);
    if (!check) {
      return res.status(404).send({ message: "Freelancer_skills not found" });
    }

    // Kiritilgan ma'lumotlarni tekshirish
    const { error, value } = freelanserSkillsValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const { freelancerId, skillId } = value;

    // Loyihani yangilash
    const [updateCount, updatedFreelSkill] = await Freelancer_skills.update(
      { freelancerId, skillId },
      { where: { id }, returning: true }
    );

    // Yangilangan loyiha mavjudligini tekshirish
    if (updateCount === 0) {
      return res.status(404).send({ message: "Freelancer_skills not found" });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Updated freelancer_skills by id successfully",
      data: updatedFreelSkill[0], // Yangilangan loyiha ma'lumotlari
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const deleteFreelancerSkillsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Loyihani ID orqali olish
    const freelskill = await Freelancer_skills.findByPk(id);
    if (!freelskill) {
      return res.status(404).send({ message: "Freelancer skills not found" });
    }

    // Loyihani o'chirish
    await Freelancer_skills.destroy({ where: { id } });

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Deleted freelancer skills by id successfully",
      data: { id }, // O'chirilgan loyiha ID sini qaytarish
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};

module.exports = {
  addNewFreelancerSkills,
  getAllFreelancerSkillss,
  getFreelancerSkillsById,
  updateFreelancerSkillsById,
  deleteFreelancerSkillsById,
};
