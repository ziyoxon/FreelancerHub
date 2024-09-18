const { errorHandler } = require("../helpers/error_handler");
const Payment = require("../models/payment.model");
const { paymenttValidation } = require("../validations/payment_validation");

const Contract = require("../models/contract.model");

const addNewPayment = async (req, res) => {
  try {
    // Kiritilgan ma'lumotlarni tekshirish
    const { error, value } = paymenttValidation(req.body);
    if (error) {
      return res.status(400).send({
        statusCode: 400,
        message: error.message,
      });
    }

    const { contractId, total_price, status, payment_date } = value;

    // Mavjud to'lovnini tekshirish (masalan: contract_id bo'yicha)
    const payment = await Payment.findOne({
      where: {
        contractId,
      },
    });

    if (payment) {
      return res.status(400).send({
        statusCode: 400,
        message: "Bunday payment mavjud",
      });
    }

    // Yangi projekt yaratish
    const newPayment = await Payment.create({
      contractId,
      total_price,
      status,
      payment_date,
    });

    // Muvaffaqiyatli javob
    res.status(201).send({
      statusCode: 201,
      message: "New Payment added successfully",
      data: newPayment, // date o'rniga data ishlatildi
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getAllPayments = async (req, res) => {
  try {
    // const decodedToken = jwt.verify(token, config.get("tokenKey"));
    // console.log(decodedToken);

    // Barcha to'lovlarni olish
    const payments = await Payment.findAll({
      include: Contract,
    });

    // tolovlarlar mavjudligini tekshirish
    if (!payments || payments.length === 0) {
      return res.status(404).send({
        statusCode: 404,
        message: "Payments not found",
      });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "All payments fetched successfully!",
      data: payments,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Loyihani ID orqali olish
    const payment = await Payment.findOne({
      include: Contract,
      where: { id },
    });
    if (!payment) {
      return res.status(404).send({
        statusCode: 404,
        message: "Payment not found",
      });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Payment found successfully",
      data: payment,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const updatePaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Loyihani ID orqali olish
    const check = await Payment.findByPk(id);
    if (!check) {
      return res.status(404).send({ message: "Payment not found" });
    }

    // Kiritilgan ma'lumotlarni tekshirish
    const { error, value } = paymenttValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const { contractId, total_price, status, payment_date } = value;

    // Loyihani yangilash
    const [updateCount, updatedPayments] = await Payment.update(
      { contractId, total_price, status, payment_date },
      { where: { id }, returning: true }
    );

    // Yangilangan loyiha mavjudligini tekshirish
    if (updateCount === 0) {
      return res.status(404).send({ message: "Payment not found" });
    }

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Updated payment by id successfully",
      data: updatedPayments[0], // Yangilangan loyiha ma'lumotlari
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const deletePaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Loyihani ID orqali olish
    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).send({ message: "Payment not found" });
    }

    // Loyihani o'chirish
    await Payment.destroy({ where: { id } });

    // Muvaffaqiyatli javob
    res.status(200).send({
      statusCode: 200,
      message: "Deleted payment by id successfully",
      data: { id }, // O'chirilgan loyiha ID sini qaytarish
    });
  } catch (error) {
    errorHandler(res, error); // Xatolikni log qilish
  }
};


module.exports = {
  addNewPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentById,
  deletePaymentById,
};
