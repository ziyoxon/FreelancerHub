const { Router } = require("express");
const {
  registerClient,
  getAllClients,
  getClientById,
  updateClientById,
  deleteClientById,
  loginClient,
  logOutClient,
  refreshTokenClient,
  clientActivate,
} = require("../controllers/client.controller");

const clientPolice = require("../middleware/client_police");
const client_role_police = require("../middleware/client_role_police");

const router = Router();

router.post("/", registerClient);
router.post("/login", loginClient);
router.post("/logout", logOutClient);
router.post("/refresh", refreshTokenClient);
router.get("/", getAllClients);
router.get("/:id", client_role_police(["READ"]), getClientById);
router.get("/activate/:link", clientActivate);
router.put("/:id", clientPolice, updateClientById);
router.delete("/:id", clientPolice, deleteClientById);

module.exports = router;
