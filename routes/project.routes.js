const { Router } = require("express");
const {
  addNewProject,
  getAllProjects,
  getProjectById,
  updateProjectById,
  deleteProjectById,
} = require("../controllers/project.controller");

const clientPolice = require("../middleware/client_police");

const router = Router();

router.post("/", clientPolice, addNewProject);
router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.put("/:id", clientPolice, updateProjectById);
router.delete("/:id", clientPolice, deleteProjectById);

module.exports = router;
