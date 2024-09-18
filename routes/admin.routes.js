const { Router } = require("express");
const {
  registerAdmin,
  getAllAdmins,
  getAdminById,
  updateAdminById,
  deleteAdminById,
  loginAdmin,
  logOutAdmin,
  refreshTokenAdmin,
  adminActivate,
} = require("../controllers/admin.controller");

const adminPolice = require("../middleware/admin_police");
const adminCreatorPolice = require("../middleware/admin_creator_police");
const adminRolePolice = require("../middleware/admin_role_police");

const router = Router();

router.post("/", adminCreatorPolice, registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", logOutAdmin);
router.post("/refresh", refreshTokenAdmin);
router.get("/", adminCreatorPolice, getAllAdmins);
router.get("/:id",adminPolice, getAdminById);
router.get("/activate/:link", adminActivate);
router.put("/:id", adminPolice, updateAdminById);
router.delete("/:id", adminRolePolice, deleteAdminById);

module.exports = router;
