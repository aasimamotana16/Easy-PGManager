const mongoose = require("mongoose");
const { GridFSBucket, ObjectId } = require("mongodb");

const ensureDb = () => {
  const db = mongoose.connection?.db;
  if (!db) {
    const err = new Error("MongoDB connection is not ready");
    err.code = "MONGO_NOT_READY";
    throw err;
  }
  return db;
};

const getBucket = (bucketName = "userDocuments") => {
  const db = ensureDb();
  return new GridFSBucket(db, { bucketName });
};

const uploadBufferToGridFS = async (
  buffer,
  { bucketName = "userDocuments", filename = "file", contentType = "application/octet-stream", metadata = {} } = {}
) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    const err = new Error("Invalid file buffer");
    err.code = "INVALID_BUFFER";
    throw err;
  }

  const bucket = getBucket(bucketName);

  return new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(String(filename || "file"), {
      contentType,
      metadata
    });

    stream.on("error", (e) => reject(e));
    stream.on("finish", (file) => {
      resolve({
        fileId: file?._id?.toString() || "",
        filename: file?.filename || filename,
        contentType: file?.contentType || contentType,
        length: file?.length || 0
      });
    });

    stream.end(buffer);
  });
};

const deleteGridFSFile = async (fileId, { bucketName = "userDocuments" } = {}) => {
  if (!fileId) return { ok: false };
  const bucket = getBucket(bucketName);
  try {
    await bucket.delete(new ObjectId(String(fileId)));
    return { ok: true };
  } catch (e) {
    // Ignore invalid ids or already-deleted files.
    return { ok: false };
  }
};

const getGridFSFileInfo = async (fileId, { bucketName = "userDocuments" } = {}) => {
  if (!fileId) return null;
  const db = ensureDb();
  try {
    const _id = new ObjectId(String(fileId));
    const info = await db.collection(`${bucketName}.files`).findOne({ _id });
    return info || null;
  } catch (e) {
    return null;
  }
};

const openGridFSDownloadStream = (fileId, { bucketName = "userDocuments" } = {}) => {
  const bucket = getBucket(bucketName);
  return bucket.openDownloadStream(new ObjectId(String(fileId)));
};

module.exports = {
  uploadBufferToGridFS,
  deleteGridFSFile,
  getGridFSFileInfo,
  openGridFSDownloadStream
};
