const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Project = sequelize.define(
  "project",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "",
    },
    description: {
      type: DataTypes.STRING(5000),
      defaultValue: "",
    },
    budget: {
      type: DataTypes.DECIMAL,
      defaultValue: null,
    },
    dead_line: {
      type: DataTypes.DATE,
      // JavaScript orqali hozirgi sanaga 7 kun qo'shish
      defaultValue: () => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date;
      },
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "pending"), // Enum qiymatlari
      defaultValue: "pending", // Default qiymat
      allowNull: false,
    },
    activation_link: {
      type: DataTypes.STRING(2000),
      defaultValue: "", // Default qiymat sifatida bo'sh string berildi
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "general", // Ixtiyoriy, default kategoriya nomi berish mumkin
    },
  },
  {
    freezeTableName: true,
    timestamps: true, // Sequelize avtomatik createdAt va updatedAt maydonlarini boshqaradi
  }
);

module.exports = Project;
