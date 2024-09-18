const express = require("express");
const cookieParser = require("cookie-parser")
const sequelize = require("./config/db");
const config = require("config");

const mainRouter = require("./routes/index.routes");
const error_handling_middleware = require("./middleware/error_handling_middleware");
const { expressWinstonLogger, expressWinstonErrorLogger } = require("./services/express_logger_middleware.js");

const PORT = config.get("PORT");

const app = express();

app.use(express.json());

app.use(cookieParser());

// So'rovlarni log qilish uchun middleware
app.use(expressWinstonLogger);

app.use("/api", mainRouter);

// Xatoliklarni log qilish uchun middleware
app.use(expressWinstonErrorLogger);

app.use(error_handling_middleware); // Error Handling eng oxirida bo'lishi kerak

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => {
      console.log(`Server started on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

start();
