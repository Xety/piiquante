const bcrypt = require('bcrypt');
const User = require('../models/User');
const Jwt = require('jsonwebtoken');

class AuthController
{
    /**
     * Function to signup an user.
     *
     * @param {object} req The request object.
     * @param {object} res The response object.
     *
     * @returns {void}
     */
    signup(req, res)
    {
        // Create a new User model.
        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8) // Hash the password with bcrypt.
        });

        // Save the user.
        user.save()
        .then(() => {
            res.status(201).json({
                message: 'Utilisateur créé avec succès'
            })
        })
        .catch((error) => {
            res.status(error.statusCode).json({
                message: error.message
            })
        });
    }

    /**
     * Function to login an user.
     *
     * @param {object} req The request object.
     * @param {object} res The response object.
     *
     * @returns {void}
     */
    login(req, res)
    {
        // Try to find the user
        User.findOne({
            email: req.body.email
        })
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    message: 'Utilisateur non trouvé'
                });
            }

            // Check the password.
            const passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    message: 'Password incorrect',
                });
            }

            // Create a jwt token.
            const token = Jwt.sign(
                {
                    exp: Math.floor(Date.now() / 1000) + parseInt(process.env.JWT_EXPIRATION),
                    userId: user._id
                },
                process.env.JWT_SECRET
            );

            res.status(200).json({
                userId: user._id,
                token: token
            });

        })
        .catch((error) => {
            res.status(error.statusCode).json({
                message: error.message
            })
        });
    }
}

module.exports = AuthController;