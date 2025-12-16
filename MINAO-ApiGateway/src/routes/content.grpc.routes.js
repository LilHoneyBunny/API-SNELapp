const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const contentClient = require('../grpc/contentClient');

router.get('/minao_systems/content/:id/files', (req, res) => {
  const contentId = parseInt(req.params.id);

  contentClient.GetFilesByContent({ contentId }, (err, response) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'gRPC content service error' });
    }
    res.json(response);
  });
});

router.delete('/minao_systems/content/files/:fileId', (req, res) => {
  const fileId = parseInt(req.params.fileId);

  contentClient.DeleteFile({ fileId }, (err, response) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'gRPC content service error' });
    }
    res.json(response);
  });
});


router.post('/minao_systems/content/:id/upload', upload.single('file'), async (req, res) => {
  const contentId = parseInt(req.params.id);

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { buffer, originalname, mimetype } = req.file;

  const call = contentClient.UploadContentFile((err, response) => {
    if (err) {
      console.error('gRPC upload error:', err);
      return res.status(500).json({ message: 'Error uploading file via gRPC' });
    }
    res.json(response);
  });

  const chunkSize = 1024 * 1024; 
  for (let offset = 0; offset < buffer.length; offset += chunkSize) {
    const end = Math.min(offset + chunkSize, buffer.length);
    call.write({
      contentId,
      data: buffer.slice(offset, end),
      fileName: originalname,
      fileType: mimetype
    });
  }

  call.end(); 
});

module.exports = router;

