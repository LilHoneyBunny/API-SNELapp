const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express();
const port = process.env.QUIZ_SERVICE_PORT || 3001;

// Rutas básicas para prueba
app.get('/', (req, res) => {
  res.send('Quiz service is running!');
});

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quiz Service API',
      version: '1.0.0',
      description: 'API for managing quizzes, submitting answers, and viewing quiz scores',
    },
  },
  apis: ['./routes/quizRoutes.js'], // Ruta del archivo donde están las rutas de quiz
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas del quizService (asegúrate de tener el archivo quizRoutes.js donde se encuentran las rutas)
const { deleteQuizController, submitQuizController, getQuizScoreController } = require('./controller/quizController');
const quizRouter = require('./routes/quizRoutes'); // Importa las rutas de quiz

// Usa el router para las rutas de quiz
app.use('/quizzes', quizRouter);

// Inicia el servidor
app.listen(port, () => {
  console.log(`Quiz service listening at http://localhost:${port}`);
});
