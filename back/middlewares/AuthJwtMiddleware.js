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

        next();
    });
  };