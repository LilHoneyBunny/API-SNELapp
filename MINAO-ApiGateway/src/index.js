require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/minao_systems/users', require('./routes/users.routes'));
app.use('/minao_systems/instructors', require('./routes/users.routes'));
app.use('/minao_systems/students', require('./routes/users.routes'));

app.use('/minao_systems/courses', require('./routes/courses.routes'));
app.use('/minao_systems/content', require('./routes/courses.routes'));
app.use("/minao_systems/student", require('./routes/courses.routes'));
app.use("/minao_systems/instructor", require('./routes/courses.routes'));

app.use('/minao_systems/content', require('./routes/content.grpc.routes'));

app.use('/minao_systems/quizzes', require('./routes/quizzes.routes'));
app.use('/minao_systems/scores', require('./routes/quizzes.routes'));
app.use('/minao_systems/report', require('./routes/quizzes.routes'));

app.use('/minao_systems/chats', require('./routes/chats.routes'));

app.listen(3002, () => {
  console.log('API Gateway running on port 3002');
});
