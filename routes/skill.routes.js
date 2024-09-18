const { Router } = require("express");
const {
  addNewSkill,
  getAllSkills,
  getSkillById,
  updateSkillById,
  deleteSkillById,
} = require("../controllers/skill.controller");

const freelancerPolice = require("../middleware/freelancer_police");

const router = Router();

router.post("/", freelancerPolice, addNewSkill);
router.get("/", getAllSkills);
router.get("/:id", getSkillById);
router.put("/:id", freelancerPolice, updateSkillById);
router.delete("/:id", freelancerPolice, deleteSkillById);

module.exports = router;
