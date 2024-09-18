const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Project = require("./project.model")

const Client = sequelize.define(
  "client",
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
      type: DataTypes.STRING(100),
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
    company_name: {
      type: DataTypes.STRING(50),
      defaultValue: "",
    },
    profile_image: {
      type: DataTypes.STRING(1000),
      defaultValue: "/client/default_client_photo.jpg",
    },
    registration_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW, // Hozirgi vaqtni boshlang‘ich qiymat sifatida o‘rnatadi
    },
    activation_link: {
      type: DataTypes.STRING(1000),
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Default qiymat aktiv emas holatda
    },
    token: {
      type: DataTypes.STRING(2000),
    },
  },
  {
    freezeTableName: true, // Jadval nomini ko'plik shaklga o'zgartirmaslik
    timestamps: true, // createdAt va updatedAt maydonlarini avtomatik qo'shish
  }
);

Project.belongsTo(Client);
Client.hasMany(Project);

module.exports = Client;
