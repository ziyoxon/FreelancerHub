const sequelize = require("../config/db");

const { DataTypes } = require("sequelize");
const Freelancer = require("../models/freelancer.model")
const Skills = require("../models/skill.model")

const FreelSkills = sequelize.define(
  "freelancerskill",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: true, // Sequelize avtomatik createdAt va updatedAt maydonlarini boshqaradi
  }
);

Freelancer.belongsToMany(Skills, { through: FreelSkills });
Skills.belongsToMany(Freelancer, { through: FreelSkills });

Freelancer.hasMany(FreelSkills);
FreelSkills.belongsTo(Freelancer);

Skills.hasMany(FreelSkills);
FreelSkills.belongsTo(Skills);

module.exports = FreelSkills;
