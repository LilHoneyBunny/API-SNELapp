const fs = require('fs');
const path = require('path');
const {addFileToContent, getFilesByContent, deleteFile} = require("../database/dao/contentFileDAO");

const contentHandlers = {
  UploadContentFile: async (call, callback) => {
    let writeStream;
    let filePath;
    let contentId;
    let fileType;
    let fileName;

     call.on('data', async (chunk) => {
      try {
        if (!writeStream) {
          contentId = chunk.contentId;
          fileName = chunk.fileName;
          fileType = chunk.fileType;
          filePath = `/uploads/${Date.now()}_${fileName}`;
          writeStream = fs.createWriteStream(`.${filePath}`);
        }

        writeStream.write(chunk.data);

      } catch (err) {
        console.error("Error writing chunk:", err);
        call.emit('error', err);
      }
    });

    call.on('end', async () => {
      try {
        writeStream.end();

        const fileId = await addFileToContent({
          contentId,
          fileUrl: filePath,
          fileType
        });

        callback(null, { success: true, fileId, message: "File uploaded successfully" });

      } catch (err) {
        console.error("UploadContentFile finalization error:", err);
        callback(null, { success: false, fileId: 0, message: "Error uploading file" });
      }
    });

    call.on('error', (err) => {
      console.error("UploadContentFile stream error:", err);
    });
  },

  GetFilesByContent: async (call, callback) => {
    try {
      const { contentId } = call.request;
      const result = await getFilesByContent(contentId);

      if (!result.success) {
        callback(null, { success: false, files: [], message: result.message });
        return;
      }

      callback(null, {
        success: true,
        files: result.data.map(f => ({ fileId: f.fileId, url: f.fileUrl, fileType: f.fileType })),
        message: "Files retrieved successfully"
      });
    } catch (error) {
      console.error("GetFilesByContent error:", error);
      callback(null, { success: false, files: [], message: "Error retrieving files" });
    }
  },

  DeleteFile: async (call, callback) => {
    try {
      const { fileId } = call.request;
      const result = await deleteFile(fileId);

      callback(null, { success: result.success, message: result.message });
    } catch (error) {
      console.error("DeleteFile error:", error);
      callback(null, { success: false, message: "Error deleting file" });
    }
  }
};

module.exports = contentHandlers;