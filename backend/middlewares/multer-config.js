const multer = require("multer")

const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp"
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "images")
    },
    filename: (req, file, callback) => {
        // console.log('🧾 Fichier original :', file.originalname); // ← Log
        // console.log('🔎 Type MIME :', file.mimetype);             // ← Log
        const name = file.originalname.split(" ").join("_").split(".")[0];
        const extention = MIME_TYPES[file.mimetype]
        if(!extention)
            return callback(new Error("Format de fichier non supporté"), false)
 
        // console.log('📸 Nom final du fichier :', file.filename);       // ← Log
        const timestamp = Date.now().toString()
        callback(null, `${name}${timestamp}.${extention}`)
    }
})

module.exports = multer({ storage }).single("image")