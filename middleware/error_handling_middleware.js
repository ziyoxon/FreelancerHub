const ApiError = require("../errors/api.error");

module.exports = function (err, req, res, next) {
  console.log(err); // nazarda tutilmagan xatoliklarni ko'rsatib turadi

  if (err instanceof ApiError) {  // instanceof qaysi classga tegishli ekanini aniqlaydi
    return res.status(err.status).send({ message: err.message });
  }
  if (err instanceof SyntaxError) {
    return res.status(err.status).send({ message: err.message });
  }

  return res.status(500).send({ message: "Nazarda tutilmagan xatolik!" });
};
