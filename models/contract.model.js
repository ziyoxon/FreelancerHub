const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Project = require("./project.model");
const Freelancer = require("./freelancer.model");

const Contract = sequelize.define(
  "contract",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    expired_date: {
      type: DataTypes.DATE,
      defaultValue: () => {
        const date = new Date();
        date.setMonth(date.getMonth() + 1); // Hozirgi sanaga 1 oy qo'shadi (yoki kerakli vaqtni sozlang)
        return date;
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "active", "completed", "canceled"), // Enum qiymatlari
      defaultValue: "pending", // Default qiymat
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

Contract.belongsTo(Freelancer);
Freelancer.hasMany(Contract);

Contract.belongsTo(Project);
Project.hasOne(Contract);

module.exports = Contract;
