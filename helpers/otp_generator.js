const { generate } = require("otp-generator");

const generateOTP = () => {
  try {
    return generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });
  } catch (error) {
    console.log(`Error generating OTP: ${error}`);
  }
};

module.exports = { generateOTP };
