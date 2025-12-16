const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const protoPath = path.join(__dirname, '../grpc/protos/content.proto');

const packageDef = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const grpcObj = grpc.loadPackageDefinition(packageDef);

const client = new grpcObj.content.ContentService(
  'localhost:50051', 
  grpc.credentials.createInsecure()
);

module.exports = client;
