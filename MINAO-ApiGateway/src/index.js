require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ USERS SERVICE (users / instructors / students viven en users_service)
const usersProxy = require("./routes/users.routes");
app.use("/minao_systems/users", usersProxy);
app.use("/minao_systems/instructors", usersProxy);
app.use("/minao_systems/students", usersProxy);

// ✅ COURSES SERVICE
const coursesProxy = require("./routes/courses.proxy");
app.use("/minao_systems/courses", coursesProxy);
app.use("/minao_systems/student", coursesProxy);
app.use("/minao_systems/instructor", coursesProxy);

// ✅ CONTENT (si esto es gRPC gateway, déjalo SOLO aquí)
app.use("/minao_systems/content", require("./routes/content.grpc.routes"));

// ✅ QUIZZES SERVICE
const quizzesProxy = require("./routes/quizzes.proxy");
app.use("/minao_systems/quizzes", quizzesProxy);
app.use("/minao_systems/scores", quizzesProxy);
app.use("/minao_systems/report", quizzesProxy);

// ✅ CHATS SERVICE
const chatsProxy = require("./routes/chats.proxy");
app.use("/minao_systems/chats", chatsProxy);

app.listen(3001, () => {
  console.log("API Gateway running on port 3001");
});
