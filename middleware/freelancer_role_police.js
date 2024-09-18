const { to } = require("../helpers/to_promise");
const Jwt = require("../services/jwt_service");

module.exports = function (roles) {
  return async function (req, res, next) {
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
      const [error, decodedToken] = await to(Jwt.verifyAccessToken(token));
      if (error) {
        res.status(403).send({
          statusCode: 403,
          message: error.message,
        });
      }
      req.client = decodedToken; // Payload keladi

      const { name, freelancer_roles } = decodedToken;;
      let hasRole = false;
      freelancer_roles.forEach((freelancer_role) => {
        if (roles.includes(freelancer_role)) hasRole = true;
      });

      if (!name ||!hasRole) {
        return res.status(403).send({
          statusCode: 403,
          message: "Sizga bunday huquq berilmagan",
        });
      }
      next();
    } catch (error) {
      console.log(error);
      res.status(400).send({
        statusCode: 400,
        message: "client ro'yhatdan o'tmagan",
      });
    }
  };
};
