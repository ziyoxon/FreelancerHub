const { Router } = require("express");
const {
  registerFreelancer,
  getAllFreelancers,
  getFreelancerById,
  updateFreelancerById,
  deleteFreelancerById,
  loginFreelancer,
  logOutFreelancer,
  refreshTokenFreelancer,
  freelancerActivate,
} = require("../controllers/freelancer.controller");

const freelancerPolice = require("../middleware/freelancer_police");
const freelancerRolePolice = require("../middleware/freelancer_role_police");

const router = Router();

router.post("/", registerFreelancer);
router.post("/login", loginFreelancer);
router.post("/logout", logOutFreelancer);
router.post("/refresh", refreshTokenFreelancer);
router.get("/", getAllFreelancers);
router.get("/:id", freelancerRolePolice(["READ"]), getFreelancerById);
router.get("/activate/:link", freelancerActivate);
router.put("/:id", freelancerPolice, updateFreelancerById);
router.delete("/:id", freelancerPolice, deleteFreelancerById);

module.exports = router;
