const { Router } = require("express");
const {
  addNewFreelancerSkills,
  getAllFreelancerSkillss,
  getFreelancerSkillsById,
  updateFreelancerSkillsById,
  deleteFreelancerSkillsById,
} = require("../controllers/freelancer_skills.controller");

const freelancerPolice = require("../middleware/freelancer_police");
const freelancerRolePolice = require("../middleware/freelancer_role_police");

const router = Router();

router.post("/", addNewFreelancerSkills);
router.get("/", getAllFreelancerSkillss);
router.get("/:id", freelancerRolePolice(["READ"]), getFreelancerSkillsById);
router.put("/:id", freelancerPolice, updateFreelancerSkillsById);
router.delete("/:id", freelancerPolice, deleteFreelancerSkillsById);

module.exports = router;
