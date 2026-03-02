const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadBuffer = (buffer, folder) => {
    console.log(`[Cloudinary] Starting upload to folder: ${folder}, buffer size: ${buffer ? buffer.length : 'UNDEFINED'} bytes`);
    return new Promise((resolve, reject) => {
        if (!buffer || buffer.length === 0) {
            return reject(new Error('Empty buffer or undefined buffer passed to uploadBuffer'));
        }
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) {
                    console.error('[Cloudinary] Upload stream error:', error);
                    return reject(error);
                }
                console.log('[Cloudinary] Upload success:', result.secure_url);
                resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

/**
 * Delete a file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise<Object>}
 */
const deleteFile = (publicId) => {
    return cloudinary.uploader.destroy(publicId);
};

module.exports = {
    cloudinary,
    uploadBuffer,
    deleteFile
};
