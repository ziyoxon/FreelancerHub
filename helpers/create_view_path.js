const path = require("node:path");

const createViewPath = (page) =>
  path.resolve(__dirname, "../views", `${page}.hbs`);

module.exports = {
  createViewPath,
};
