const { Router } = require('express');
const calculateRouter = require('./calculate');

module.exports = () => {
  const router = Router();

  router.use('/calculate', calculateRouter());

  return router;
};
