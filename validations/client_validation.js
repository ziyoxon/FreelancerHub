const Joi = require("joi");

exports.clientValidation = (data) => {
  const schemaClient = Joi.object({
    full_name: Joi.string().required().trim(),
    email: Joi.string().email().lowercase().trim(),
    password: Joi.string()
      .min(5)
      .required()
      .pattern(new RegExp("^[a-zA-Z0-9!@#$]{6,30}$")),
    company_name: Joi.string().optional().default(""),
    profile_image: Joi.string().default("/client/default_client_photo.jpg"),
    registration_date: Joi.date().default(new Date()),
    activation_link: Joi.string(),
    is_active: Joi.boolean().default(false),
  });
  return schemaClient.validate(data, { abortEarly: false });
};
