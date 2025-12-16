require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/users', require('./routes/users.routes'));
app.use('/quizzes', require('./routes/quizzes.routes'));
app.use('/courses', require('./routes/courses.routes'));

app.listen(3002, () => {
  console.log('API Gateway running on port 3002');
});
