const express = require('express');
const axios = require('axios');
const router = express.Router();

const { coursesService } = require('../config/services.js');

// Proxy general para rutas del microservicio (ej: view, get metadata, etc.)
router.use(async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${coursesService}${req.originalUrl}`,
      data: req.body,
      headers: {
        ...req.headers,
        host: undefined
      },
      responseType: req.originalUrl.includes('/files/view/') ? 'stream' : 'json'
    });

    if (req.originalUrl.includes('/files/view/')) {
      // Para archivos PDF/imágenes, enviamos el stream directamente
      response.data.pipe(res);
    } else {
      res.status(response.status).json(response.data);
    }
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { msg: 'Gateway error' }
    );
  }
});

module.exports = router;
