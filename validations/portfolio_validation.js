const Joi = require("joi");

exports.portfolioValidation = (data) => {
  const schemaPortfolio = Joi.object({
    project_title: Joi.string().required().trim().max(100),
    project_description: Joi.string()
      .trim()
      .max(2000)
      .default("Project description"),
    project_link: Joi.string().trim().max(2000).default(""),
    freelancerId: Joi.number(),
  });

  return schemaPortfolio.validate(data, { abortEarly: false });
};
