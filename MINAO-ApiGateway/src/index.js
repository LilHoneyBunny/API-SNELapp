require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/minao_systems/users', require('./routes/users.routes'));
app.use('/minao_systems/quizzes', require('./routes/quizzes.routes'));
app.use('/minao_systems/courses', require('./routes/courses.routes'));

app.listen(3002, () => {
  console.log('API Gateway running on port 3002');
});
