
const errorHandler = (res, error) => {
  console.error(error);
  res.status(400).send({ error: error.message });
};

module.exports = {
  errorHandler,
};