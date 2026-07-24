const express = require("express")
const router = express.Router();
const bookCtrl = require("../controllers/book")
const auth = require("../middlewares/auth")
const multer = require("../middlewares/multer-config")

router.get("/bestrating", bookCtrl.getBestRatedBooks)
router.get("/", bookCtrl.getBooks)
router.get("/:id", bookCtrl.getBook)
router.post("/", auth, multer, bookCtrl.createBook)
router.post("/:id/rating", auth, bookCtrl.addNewRating)
router.put("/:id", auth, multer, bookCtrl.updateBook)
router.delete("/:id", auth, bookCtrl.deleteBook)


module.exports = router;