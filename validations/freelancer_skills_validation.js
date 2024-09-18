const Joi = require("joi");

exports.freelanserSkillsValidation = (data) => {
  const schemaFreelancerSkills = Joi.object({
    freelancerId: Joi.number().required(),
    skillId: Joi.number().required(),
  });

  return schemaFreelancerSkills.validate(data, { abortEarly: false });
};
