const Joi = require("joi");

exports.paymenttValidation = (data) => {
  const schemaPayment = Joi.object({
    total_price: Joi.number().optional().default(0),
    status: Joi.string()
      .valid("pending", "active", "completed", "failed", "canceled")
      .default("pending"),
    payment_date: Joi.date().default(new Date()),
    contractId: Joi.number(),
  });
  return schemaPayment.validate(data, {
    abortEarly: false,
  });
};
