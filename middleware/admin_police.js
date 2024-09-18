const { to } = require("../helpers/to_promise");
const adminJwt = require("../services/admin_jwt_service");

module.exports = async function (req, res, next) {
  try {
    // authorization
    const authorization = req.headers.authorization;
    if (!authorization) {
      res.status(403).send({
        statusCode: 403,
        message: "Token Berilmagan",
      });
    }
    // console.log(authorization);
    const bearer = authorization.split(" ")[0];
    const token = authorization.split(" ")[1];

    if (bearer != "Bearer" || !token) {
      return res.status(403).send({
        statusCode: 403,
        message: "Token noto'g'ri",
      });
    }
    const [error, decodedToken] = await to(adminJwt.verifyAccessToken(token));
    console.log(decodedToken);
    if (error) {
      res.status(403).send({
        statusCode: 403,
        message: error.message,
      });
    }
    req.admin = decodedToken;
    next();
  } catch (error) {
    console.log(error);
    res.status(400).send({
      statusCode: 400,
      message: "Admin ro'yhatdan o'tmagan",
    });
  }
};
