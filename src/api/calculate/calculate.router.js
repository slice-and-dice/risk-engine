const { Router } = require('express');
const calculateController = require('./calculate.controller.js');

module.exports = () => {
  const router = Router();

  router.post('', async (req, res) => {
    res.send(await calculateController(req.body.answerIds));
  });

  return router;
};
