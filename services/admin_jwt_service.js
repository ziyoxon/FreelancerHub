const config = require("config");
const jwt = require("jsonwebtoken");

class JwtService {
  constructor(accesKey, refreshKey, accessTime, refreshTime) {
    this.accesKey = accesKey;
    this.refreshKey = refreshKey;
    this.accessTime = accessTime;
    this.refreshTime = refreshTime;
  }
  generateTokens(payLoad) {
    const accessToken = jwt.sign(payLoad, this.accesKey, {
      expiresIn: this.accessTime,
    });

    const refreshToken = jwt.sign(payLoad, this.refreshKey, {
      expiresIn: this.refreshTime,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
  async verifyAccessToken(token) {
    return jwt.verify(token, this.accesKey);
  }

  async verifyRefreshToken(token) {
    return jwt.verify(token, this.refreshKey);
  }
}

module.exports = new JwtService(
  config.get("admin_acces_key"),
  config.get("admin_refresh_key"),
  config.get("admin_access_time"),
  config.get("admin_refresh_time")
);
