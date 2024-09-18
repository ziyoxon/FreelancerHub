const Joi = require("joi");

exports.projectValidation = (data) => {
  const schemaProject = Joi.object({
    title: Joi.string().required().trim().min(5).max(100),
    description: Joi.string().required().trim().min(10).max(5000),
    budget: Joi.number().optional().default(0),
    dead_line: Joi.date().default(() => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    }),
    status: Joi.string()
      .valid("pending", "active", "completed", "canceled")
      .default("pending"),
    activation_link: Joi.string().default("").trim(),
    category: Joi.string().default("general").trim(),
    clientId: Joi.number(),
  });

  return schemaProject.validate(data, { abortEarly: false });
};
