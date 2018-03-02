const { hygienePotentialHazardService } = require('../../services/');
const store = require('../../store');
const winston = require('winston');

module.exports = async (answerIds) => {
  winston.info('calculate controller called');

  try {
    const result = await hygienePotentialHazardService.calculateRisk(answerIds);
    return result;
  }
  catch (err) {
    winston.error(`calculate controller error: ${err}`);
    return err;
  }
};