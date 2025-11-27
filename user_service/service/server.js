const express = require ('express');
const cors = require ('cors');
const swaggerUi = require("swagger-ui-express");
const { swaggerDocument} = require('../documentation/swagger');

class Server{
    constructor(){
        this.app = express();
        this.port = process.env.SERVER_PORT;
        this.middleware();
        this.routes();
    }

    middleware(){
        const corsOptions = {
            origin: ["http://localhost:8085"],
            methods: "GET,PUT,PATCH,POST,DELETE",
        };

        this.app.use(cors(corsOptions));
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
        this.app.use(express.static('public'));
    }

    routes(){
        this.app.use("/minao_api/users", require('../routes/userRoutes'));
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    }

    listen() {
        this.app.listen(this.port, ()=>{
            console.log(`MINAO Systems listening in port ${this.port}`);
            console.log(`http://localhost:${this.port}`);
        });
    }
}

module.exports = Server;