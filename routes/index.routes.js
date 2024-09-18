const { Router } = require("express");

const adminRouter = require("./admin.routes");
const clientRouter = require("./client.routes");
const freelancerRouter = require("./freelancer.routes");
const skillRouter = require("./skill.routes");
const freelanserSkillsRouter = require("./freelancer_skills.routes");
const portfolioRouter = require("./portfolio.routes");
const projectRouter = require("./project.routes");
const paymentRouter = require("./payment.routes");
const contractRouter = require("./contract.routes");

const router = Router();

router.use("/admin", adminRouter);
router.use("/client", clientRouter);
router.use("/freelancer", freelancerRouter);
router.use("/skill", skillRouter);
router.use("/freelskills", freelanserSkillsRouter);
router.use("/portfolio", portfolioRouter);
router.use("/project", projectRouter);
router.use("/payment", paymentRouter);
router.use("/contract", contractRouter);

module.exports = router;
