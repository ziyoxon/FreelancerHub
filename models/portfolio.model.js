const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Portfolio = sequelize.define(
  "portfolio",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    project_title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    project_description: {
      type: DataTypes.STRING(2000),
      defaultValue: "Project description", // Default qiymat sifatida bo'sh string
    },
    project_link: {
      type: DataTypes.STRING(2000),
      defaultValue: "", // Default qiymat sifatida bo'sh string
    },
  },
  {
    freezeTableName: true, // Jadval nomini avtomatik ko'plik shaklga o'zgartirishdan saqlaydi
    timestamps: true, // createdAt va updatedAt ustunlarini avtomatik qo'shadi
  }
);

module.exports = Portfolio;
