const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Portfolio = require("./portfolio.model");

const Freelancer = sequelize.define(
  "freelancer",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true, // To'g'ri email formatini tekshiradi
      },
    },
    password: {
      type: DataTypes.STRING(255), // Parol uzunligi oshirildi, yaxshiroq xavfsizlik uchun
      allowNull: false,
    },
    profile_image: {
      type: DataTypes.STRING,
      defaultValue: "avatar.jpg",
    },
    rating: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    experiance_year: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    bio: {
      type: DataTypes.STRING(2000),
      defaultValue: "",
    },
    registration_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    activation_link: {
      type: DataTypes.STRING,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    token: {
      type: DataTypes.STRING(1000),
    },
  },
  {
    freezeTableName: true,
    timestamps: true, // createdAt va updatedAt maydonlarini avtomatik qo'shish
  }
);

Freelancer.hasMany(Portfolio);
Portfolio.belongsTo(Freelancer);

module.exports = Freelancer;
