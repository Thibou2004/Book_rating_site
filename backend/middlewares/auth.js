const jwt = require("jsonwebtoken")
module.exports = (req, res, next) => {
  try {
    // console.log(req.headers)
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decodedToken.userId;
    req.auth = {
        userId: userId
    };

    next();
  }
  catch (error) {
    return res.status(401).json({ error })
  }
};