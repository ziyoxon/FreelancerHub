const Joi = require("joi");

exports.skillValidation = (data) => {
  const schemaSkill = Joi.object({
    skill_name: Joi.string().required(),
  });

  return schemaSkill.validate(data, { abortEarly: false });
};
