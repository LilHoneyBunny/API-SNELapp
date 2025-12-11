const fs = require('fs');
const path = require('path');

module.exports = function createReflectionHandlers(services, protoFiles) {
    const descriptorBytes = protoFiles.map((file) => {
        const protoPath = path.resolve(file);
        return fs.readFileSync(protoPath);
    });

    return {
        ServerReflectionInfo: function (call) {

            call.on('data', (request) => {
                const response = {
                    valid_host: "",
                };

                if (request.list_services) {
                    response.list_services_response = {
                        service: [
                            ...Object.keys(services).map((name) => ({ name })),
                            { name: "grpc.reflection.v1alpha.ServerReflection" }
                        ]
                    };
                } 

                else {
                    response.file_descriptor_response = {
                        file_descriptor_proto: descriptorBytes
                    };
                }

                call.write(response);
            });

            call.on('end', () => call.end());
        }
    };
};
