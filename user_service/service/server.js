const express = require("express");
const path = require("path");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const { swaggerDocument } = require("../documentation/swagger");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.SERVER_PORT || 3000;
    this.middleware();
    this.routes();
  }

  middleware() {
    const corsOptions = {
      origin: ["http://localhost:8085", "http://10.0.2.2:8080", "http://127.0.0.1:8085", "*"],
      methods: "GET,PUT,PATCH,POST,DELETE",
      allowedHeaders: ["Content-Type", "Authorization"],
    };

    this.app.use(cors(corsOptions));
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(express.urlencoded({ limit: "50mb", extended: true }));
    this.app.use(express.static("public"));

    // ✅ static hosting de uploads
    this.app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
  }

  routes() {
    this.app.use("/minao_systems/users", require("../routes/userRoutes"));
    this.app.use("/minao_systems/instructors", require("../routes/instructorRoutes"));
    this.app.use("/minao_systems/students", require("../routes/studentRoutes"));
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`MINAO Systems listening in port ${this.port}`);
      console.log(`http://localhost:${this.port}`);
    });
  }
}

module.exports = Server;
