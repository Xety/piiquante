const Jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // We get the header and do various test to get the token.
    const bearerHeader = req.headers["authorization"];

    if (typeof bearerHeader === 'undefined') {
        return res.status(403).send({
            message: "No token provided!"
        });
    }

    const token = bearerHeader.split(' ')[1];

    if (typeof token === 'undefined') {
        return res.status(403).send({
            message: "No token provided!"
        });
    }

    // We verify the token.
   Jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

        if (err) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
        }
        const userId = decoded.userId;
        // If the userId is present int he body that means it's an update of the sauce or a like/dislike
        if (req.body.userId && req.body.userId !== userId) {
            return res.status(403).send({
                message: "Unauthorized userId!"
            });
        }

        next();
    });
  };