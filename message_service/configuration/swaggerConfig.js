const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de Mensajes',
    version: '1.0.0',
    description: 'Documentación de la API de Mensajes de SnelApp',
  },
  servers: [
    {
      url: 'http://localhost:5002',
      description: 'Servidor local',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
