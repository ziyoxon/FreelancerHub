const Joi = require("joi");

exports.contractValidation = (data) => {
  const schemaContract = Joi.object({
    expired_date: Joi.date().default(() => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    }),
    projectId: Joi.number(),
    freelancerId: Joi.number(),
    status: Joi.string()
      .valid("pending", "active", "completed", "canceled")
      .required(),
    is_active: Joi.boolean().default(false)
  });
  return schemaContract.validate(data, {
    abortEarly: false,
  });
};
