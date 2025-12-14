const fs = require('fs');
const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('../grpc/protos/content.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const contentProto = grpc.loadPackageDefinition(packageDefinition).content;

const client = new contentProto.ContentService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);


function uploadFile(contentId, filePath, fileType) {
  const call = client.UploadContentFile((err, response) => {
    if (err) console.error('Error uploading file:', err);
    else console.log('Upload response:', response);
  });

  const fileName = path.basename(filePath);
  const stream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 });

  stream.on('data', (chunk) => {
    call.write({ contentId, fileName, fileType, data: chunk });
  });

  stream.on('end', () => call.end());
  stream.on('error', (err) => {
    console.error('Stream error:', err);
    call.end();
  });
}


function getFilesByContent(contentId) {
  client.GetFilesByContent({ contentId }, (err, response) => {
    if (err) console.error('Error fetching files:', err);
    else console.log('Files:', response.files);
  });
}


function deleteFile(fileId) {
  client.DeleteFile({ fileId }, (err, response) => {
    if (err) console.error('Error deleting file:', err);
    else console.log('Delete response:', response);
  });
}









 