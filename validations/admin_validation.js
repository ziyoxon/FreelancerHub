const Joi = require("joi");

exports.adminValidation = (data) => {
  const schemaAdmin = Joi.object({
    full_name: Joi.string().required().trim(),
    login: Joi.string().required().trim(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9!@#$]{6,30}$"))
      .required()
      .trim(),
    is_active: Joi.boolean().default(false),
    is_creator: Joi.boolean().default(false),
    activation_link: Joi.string(),
    token: Joi.string(),
  });
  return schemaAdmin.validate(data, { abortEarly: false });
};
