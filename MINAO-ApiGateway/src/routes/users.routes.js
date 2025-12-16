const express = require('express');
const axios = require('axios');
const router = express.Router();

const { usersService } = require('../config/services.js');

router.use(async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${usersService}${req.originalUrl}`,
      data: req.body,
      headers: {
        ...req.headers,
        host: undefined 
      }
    });

    res.status(response.status).json(response.data);

  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { msg: 'Gateway error' }
    );
  }
});

module.exports = router;
