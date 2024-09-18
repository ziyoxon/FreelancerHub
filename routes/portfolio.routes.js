const { Router } = require("express");
const {
  addNewPortfolio,
  getAllPortfolios,
  getPortfolioById,
  updatePortfolioById,
  deletePortfolioById,
} = require("../controllers/portfolio.controller");

const router = Router();

router.post("/", addNewPortfolio);
router.get("/", getAllPortfolios);
router.get("/:id", getPortfolioById);
router.put("/:id", updatePortfolioById);
router.delete("/:id", deletePortfolioById);

module.exports = router;
