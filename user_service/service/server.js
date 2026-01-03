const express = require('express');
const cors = require('cors');
const swaggerUi = require("swagger-ui-express");
const { swaggerDocument } = require('../documentation/swagger');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.SERVER_PORT || 8000; // fallback seguro
        this.middleware();
        this.routes();
    }

    middleware() {
        const corsOptions = {
            origin: ["http://localhost:8085", "*"],
            methods: "GET,PUT,PATCH,POST,DELETE",
        };

        this.app.use(cors(corsOptions));
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
        this.app.use(express.static('public'));

        // (No lo elimino aunque esté repetido)
        this.app.use("/minao_systems/students", require('../routes/studentRoutes'));
    }

    routes() {
        this.app.use("/minao_systems/users", require('../routes/userRoutes'));
        this.app.use("/minao_systems/instructors", require('../routes/instructorRoutes'));

        // repetido a propósito (como lo pediste)
        this.app.use("/minao_systems/students", require('../routes/studentRoutes'));

        this.app.use(
            '/api-docs',
            swaggerUi.serve,
            swaggerUi.setup(swaggerDocument)
        );

        // repetido a propósito
        this.app.use("/minao_systems/students", require('../routes/studentRoutes'));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`MINAO Systems listening on port ${this.port}`);
            console.log(`http://localhost:${this.port}`);
        });
    }
}

module.exports = Server;
