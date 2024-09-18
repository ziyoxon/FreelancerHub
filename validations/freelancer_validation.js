const Joi = require("joi");

exports.freelancerValidation = (data) => {
  const schemaFreelancer = Joi.object({
    full_name: Joi.string().required().trim(),
    email: Joi.string().email().lowercase().trim(),
    password: Joi.string()
      .min(5)
      .required()
      .pattern(new RegExp("^[a-zA-Z0-9!@#$]{6,30}$")),
    profile_image: Joi.string().default("/photo/avatar.jpg"),
    rating: Joi.number().trim(),
    experiance_year: Joi.number().trim(),
    bio: Joi.string().trim().default(""),
    registration_date: Joi.date().default(new Date()),
    activation_link: Joi.string(),
    is_active: Joi.boolean().default(false),
  });
  return schemaFreelancer.validate(data, { abortEarly: false });
};
