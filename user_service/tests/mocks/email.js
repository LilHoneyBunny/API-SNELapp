// user_service/tests/mocks/email.js
// Mock simple de utilidades de email (sendEmail/loadTemplate/generateVerificationCode)

const sendEmail = jest.fn().mockResolvedValue(true);

const loadTemplate = jest.fn((templatePath, variables = {}) => {
  // Simula HTML resultante
  return `TEMPLATE:${templatePath}::${JSON.stringify(variables)}`;
});

const generateVerificationCode = jest.fn(() => "123456");

module.exports = {
  sendEmail,
  loadTemplate,
  generateVerificationCode,
};
