const express = require('express');
const cors = require('cors');
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const { swaggerDocument } = require('../documentation/swagger');

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const contentHandlers = require('../grpc/handler');
const createReflectionHandlers = require('../grpc/reflection/reflectionHandlers');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.SERVER_PORT || 8000;

        this.middleware();
        this.routes();
        this.startGrpcServer();
    }

    middleware() {
        const corsOptions = {
            origin: ["http://localhost:8085"],
            methods: "GET,PUT,PATCH,POST,DELETE",
        };

        this.app.use(cors(corsOptions));
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
        this.app.use(express.static('public'));
        this.app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
    }

    routes() {
        this.app.use("/minao_systems/courses", require('../routes/courseRoutes'));
        this.app.use("/minao_systems/content", require('../routes/contentRoutes'));
        this.app.use("/minao_systems/student", require('../routes/courseStudentRoutes'));
        this.app.use("/minao_systems/instructor", require('../routes/courseInstructorRoutes'));
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    }

    startGrpcServer() {
        const protoPath = path.join(__dirname, "..", "grpc", "protos", "content.proto");
        const reflectionProtoPath = path.join(__dirname, "..", "grpc", "protos", "reflection.proto");

        const packageDef = protoLoader.loadSync(
            [protoPath, reflectionProtoPath],
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            }
        );

        const grpcObj = grpc.loadPackageDefinition(packageDef);
        const server = new grpc.Server();

        // Content service
        server.addService(
            grpcObj.content.ContentService.service,
            contentHandlers
        );

        // Reflection service
        const reflectionHandlers = createReflectionHandlers(
            { "content.ContentService": protoPath },
            [protoPath, reflectionProtoPath]
        );

        server.addService(
            grpcObj.grpc.reflection.v1alpha.ServerReflection.service,
            reflectionHandlers
        );

        server.bindAsync(
            '0.0.0.0:50052',
            grpc.ServerCredentials.createInsecure(),
            (err, port) => {
                if (err) {
                    console.error('❌ Error binding gRPC server:', err);
                    return;
                }

                console.log(`✅ gRPC server running on port ${port}`);
                // 🚫 NO server.start() (grpc-js moderno)
            }
        );
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`MINAO Systems listening on port ${this.port}`);
            console.log(`http://localhost:${this.port}`);
        });
    }
}

module.exports = Server;
