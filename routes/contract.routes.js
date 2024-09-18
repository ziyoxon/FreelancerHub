const { Router } = require("express");
const {
  addNewContract,
  getAllContracts,
  getContractById,
  updateContractById,
  deleteContractById,
} = require("../controllers/contract.controller");

const clientPolice = require("../middleware/client_police");

const router = Router();

router.post("/", clientPolice, addNewContract);
router.get("/", getAllContracts);
router.get("/:id", getContractById);
router.put("/:id", clientPolice, updateContractById);
router.delete("/:id", clientPolice, deleteContractById);

module.exports = router;

