const express = require('express');
const axios = require('axios');
const router = express.Router();

const { quizzesService } = require('../config/services.js');

router.use(async (req, res) => {
  try {
    // Enviamos el path completo tal cual, sin quitar /minao_systems
    const proxiedPath = req.originalUrl;

    const response = await axios({
      method: req.method,
      url: `${quizzesService}${proxiedPath}`,
      data: req.body,
      headers: {
        ...req.headers,
        host: undefined // evitar conflicto con el host del Gateway
      },
      responseType: 'json' // para que axios interprete JSON automáticamente
    });

    // Respondemos con el JSON tal cual lo recibe del microservicio
    res.status(response.status).send(response.data);

  } catch (error) {
    console.error('❌ Error en Gateway (quizzes):', error.message);

    res.status(error.response?.status || 500).json(
      error.response?.data || { msg: 'Gateway error' }
    );
  }
});

module.exports = router;
