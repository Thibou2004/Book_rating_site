const sharp = require("sharp");
const fsPromises = require("fs").promises

/**
 * Cette fonction permet d'optimiser une image en changeant ces dimensions et son format en webP.
 * @param {string} inputPath 
 * @param {string} newFilename 
 * @param {number} quality 
 * @param {number} width 
 * @returns 
 */
exports.optimizeImage = async (inputPath, newFilename, quality, width) => {
    try {
      await sharp(inputPath)
      .webp({ quality })
      .resize({ width })
      .toFile(`images/${newFilename}`);
    
      await fsPromises.unlink(inputPath)
    }
    catch(error) {
      console.error("Erreur traitement image", error);
      return res.status(500).json({ message: "Erreur lors du traitement de l'image" });
    }
}