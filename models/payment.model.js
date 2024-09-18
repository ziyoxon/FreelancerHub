const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Contract = require("./contract.model");

const Payment = sequelize.define(
  "payment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    total_price: {
      type: DataTypes.DECIMAL,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM("pending", "active", "completed", "canceled"), // Enum qiymatlari belgilangan
      defaultValue: "pending", // Default qiymat
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW, // Hozirgi sanani o'rnatish uchun
    },
  },
  {
    freezeTableName: true,
    timestamps: true, // Sequelize avtomatik createdAt va updatedAt maydonlarini boshqaradi
  }
);

Payment.belongsTo(Contract);
Contract.hasOne(Payment);

module.exports = Payment;
