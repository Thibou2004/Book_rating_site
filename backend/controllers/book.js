const Book = require("../models/Book");
const fsPromises = require("fs").promises
const utils = require("../utils/utils")

exports.getBooks = async (req, res) => {
   try {
     const books = await Book.find()

     return res.status(200).json(books)
   }
   catch(error) {
     console.error("Erreur dans getBooks", error)
     return res.status(500).json({ message: "Erreur server", error: error.message})
   }
}

exports.getBook = async (req, res) => {
   try {
     const book = await Book.findOne({ _id: req.params.id })
     if(!book)
        return res.status(404).json({ message: "Livre non trouvé" })
     
     return res.status(200).json(book)
   }
   catch(error) {
     console.error("Erreur dans getBook", error)
     return res.status(500).json({ message: "Erreur server", error: error.message})
   }
}

exports.createBook = async (req, res) => {
    try {
      const bookObject = JSON.parse(req.body.book);
      delete bookObject.userId
      const newFilename = req.file.filename.split('.')[0] + '.webp';
      const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${newFilename}`
      })
      const inputPath = req.file.path;

      utils.optimizeImage(inputPath, newFilename, 100, 200)

      await book.save()

      return res.status(201).json({ message: "Livre enregistré" })
    }
    catch(error) {
      console.error("Erreur dans createBook", error)
      return res.status(500).json({ message: "Erreur server", error: error.message})        
    }
}

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });

    if(!book) {
        return res.status(404).json({ message: "Livre non trouvé"})
    }

    if (book.userId !== req.auth.userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const newBookData = req.file ? { ...JSON.parse(req.body.book), _id: req.params.id } : {...req.body, _id: req.params.id};

    if (req.file) {
        const oldFilename = book.imageUrl.split("/images/")[1];
        await fsPromises.unlink(`images/${oldFilename}`);

        const inputPath = req.file.path;
        const newFilename = req.file.filename.split('.')[0] + '.webp';
        utils.optimizeImage(inputPath, newFilename, 100, 200)
                                        
        newBookData.imageUrl = `${req.protocol}://${req.get('host')}/images/${newFilename}`;
    }

    await Book.updateOne({ _id: req.params.id }, newBookData);
    res.status(200).json({ message: "Livre mis à jour" });
  } catch (error) {
    console.error("Erreur dans updateBook", error)
    return res.status(500).json({ message: "Erreur server", error: error.message})  
  }
};

exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id })
        
        if(book.userId !== req.auth.userId)
            return res.status(401).json({ message: "Non autorisé" })

        const filename = book.imageUrl.split("/images/")[1]
        await fsPromises.unlink(`images/${filename}`);
        await Book.deleteOne({ _id: req.params.id })

        return res.status(200).json({ message: "Livre supprimé"})
    }
    catch(error) {
      console.error("Erreur dans updateBook", error)
      return res.status(500).json({ message: "Erreur server", error: error.message})        
    }
}

exports.getBestRatedBooks = async (req, res) => {
try {
    const books = await Book.find();
    if(books.length === 0)
        return res.status(404).json({ message: "Livres non trouvé" })

    const filteredBooks = books.sort((a, b) => b.averageRating - a.averageRating).slice(0, 3)
    return res.status(200).json(filteredBooks)
}
catch(error) {
    console.error("Erreur dans getBestRatedBooks:", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
}
}

exports.addNewRating = async (req, res) => {
    try {
       if(req.body.userId !== req.auth.userId) {
         return res.status(401).json({ message: "Non autorisé" })
       }
       
       const book = await Book.findOne({ _id: req.params.id })
       if(!book) {
         return res.status(404).json({ message: "Livre non trouvé" })
       }
       
       const userRate = {
        userId: req.body.userId,
        grade: req.body.rating
       }
       book.ratings.push(userRate)

       const total = book.ratings.reduce((acc, rate) => acc + rate.grade, 0)
       book.averageRating = Math.floor(total / book.ratings.length)

       await book.save()
       return res.status(200).json(book)
    }
    catch(error) {
      console.error(error)
      return res.status(error.status || 500).json({ error })
    }
}