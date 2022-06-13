const fs = require("fs");
const Jwt = require('jsonwebtoken');
const Sauce = require('../models/Sauce');

class SaucesController
{
    /**
     * Get all sauces.
     *
     * @param {object} req The request object.
     * @param {object} res The response object.
     *
     * @returns {void}
     */
    index(req, res)
    {
        Sauce.find()
            .then((sauces) => {
                res.status(200).json(sauces)
            })
            .catch((error) => {
                res.status(error.statusCode).json({
                    message: error.message
                });
            });
    }

    /**
     * Get a specific sauce related to it's id.
     *
     * @param {object} req The request object.
     * @param {object} res The response object.
     *
     * @returns {void}
     */
    show(req, res)
    {
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                res.status(200).json(sauce)
            })
            .catch((error) => {
                res.status(error.statusCode).json({
                    message: error.message
                });
            });
    }

    /**
     * Handle the creation of a sauce.
     *
     * @param {object} req The request object.
     * @param {object} res The response object.
     *
     * @returns {object|void} The response object.
     */
    create(req, res)
    {
        const sauceObject = JSON.parse(req.body.sauce);

        // Check if Multer has allowed the image or not.
        if (typeof req.file === 'undefined') {
            return res.status(400).json({
                message: 'Image non autorisé'
            });
        }

        // Create the sauce model.
        const sauce = new Sauce({
            ...sauceObject,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        });

        sauce.save()
            .then(() => {
                res.status(201).json({
                    message: 'Sauce crée avec succès'
                })
            })
            .catch((error) => {
                res.status(error.statusCode).json({
                    message: error.message
                });
            });
    }

    /**
     * Handle the update of a sauce.
     *
     * @param {object} req The request object.
     * @param {object} res The response object.
     *
     * @returns {object} The response object.
     */
    update(req, res)
    {
        const token = SaucesController.getToken(req);

        if(token === false) {
            return res.status(403).send({
                message: "No token provided!"
            });
        }
        const decoded = Jwt.verify(token, process.env.JWT_SECRET);

        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                // Verify that the connected user is the creator of the sauce.
                if (sauce.userId !== decoded.userId) {
                    return res.status(403).json({
                        message: "Not the creator of the sauce!"
                    });
                }

                const filename = sauce.imageUrl.split("/images/")[1];

                // The file is not allowed or the user has not changed the original file.
                if (typeof req.file === 'undefined')  {
                    const sauceObject = {...req.body};

                    SaucesController._update(req, res, sauceObject);
                } else {

                    const sauceObject = {
                        ...JSON.parse(req.body.sauce),
                        imageUrl: `${req.protocol}://${req.get("host")}/images/${ req.file.filename }`,
                    };

                    // Delete the old file.
                    fs.unlink(`images/${filename}`, () => {
                        SaucesController._update(req, res, sauceObject);
                    });
                }
            })
            .catch((error) => {
                res.status(error.statusCode).json({
                    message: error.message
                });
            });
    }

    /**
     * Handle the update of a sauce.
     *
     * @param {object} req The request object.
     * @param {object} res The response object.
     * @param {object} sauceObject The data to save.
     *
     * @returns {void}
     */
    static _update(req, res, sauceObject)
    {
        Sauce.updateOne({ _id: req.params.id}, { ...sauceObject })
            .then(() => {
               res.status(200).json({
                    message: 'Sauce modifiée'
                })
            })
            .catch((error) => {
                res.status(error.statusCode).json({
                    message: error.message
                });
            });
    }

    /**
     * Delete a sauce.
     *
     * @param {object} req The request object.
     * @param {object} res The response object.
     *
     * @returns {object} The response object.
     */
    destroy(req, res)
    {
        const token = SaucesController.getToken(req);

        if(token === false) {
            return res.status(403).send({
                message: "No token provided!"
            });
        }
        const decoded = Jwt.verify(token, process.env.JWT_SECRET);

        Sauce.findOne({
                _id: req.params.id
            })
            .then((sauce) => {
                // Verify that the connected user is the creator of the sauce.
                if (sauce.userId !== decoded.userId) {
                    return res.status(403).json({
                        message: "Not the creator of the sauce!"
                    });
                }

                const filename = sauce.imageUrl.split("/images/")[1]; // Get filename.

                // Delete the file then delete the sauce in database.
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => {
                            res.status(200).json({
                                message: "Sauce supprimée"
                            })
                        })
                        .catch((error) => {
                            res.status(error.statusCode).json({
                                message: error.message
                            });
                        });
                });
            })
            .catch((error) => {
                res.status(error.statusCode).json({
                    message: error.message
                 });
            });
    }

    /**
     * Rate a sauce.
     *
     * Description:
     *
     *       1 : like
     *     -1 : dislike
     *      0 : cancel like/dislike
     *
     * @param {object} req The request object.
     * @param {object} res The response object.
     *
     * @returns {object} The response object.
     */
    async rate(req, res)
    {
        const { userId, like } = req.body;

        const sauce = await Sauce.findById(req.params.id);
        //Get the array of users that like/disliked the sauce.
        const { usersLiked, usersDisliked } = sauce;

        switch (like) {
            case 1:
                // Check if the user has not already liked the sauce.
                if (usersLiked.includes(userId)) {
                    return res.status(409).json({
                        message: error.message
                    });
                };

                usersLiked.push(userId);
                break;

            case 0:
                // If the usersLike array contain the user id, that means the user has liked the post
                // else it was a dislike, and we must delete the id from the array.
                if (usersLiked.includes(userId)) {
                    const index = usersLiked.indexOf(userId);

                    usersLiked.splice(index, 1);
                } else {
                    const index = usersDisliked.indexOf(userId);

                    usersDisliked.splice(index, 1);
                }
                break;

            case -1:
                // Check if the user has not already disliked the sauce.
                if (usersDisliked.includes(userId)) {
                    return res.status(409).json({
                        message: error.message
                    });
                };

                usersDisliked.push(userId);
                break;

            default:
                res.status(400).json({
                    message: error.message
                });
        }

        // Update the number of likes/dislikes.
        sauce.likes = usersLiked.length;
        sauce.dislikes = usersDisliked.length;

        // Update the array of users.
        sauce.usersLiked = usersLiked;
        sauce.usersDisliked = usersDisliked;

        // Save the sauce with the updated data.
        sauce.save()
            .then(() => {
                res.status(200).json({
                    message: 'Sauce mise à jour avec succès'
                })
            })
            .catch((error) => {
                res.status(error.statusCode).json({
                    message: error.message
                })
            });
    }

    /**
     * Get the token from the header.
     *
     * @param {object} req
     *
     * @returns {false|string} False if no token or invalid token, else the token.
     */
    static getToken(req)
    {
        const bearerHeader = req.headers["authorization"];

        if (typeof bearerHeader === 'undefined') {
            return false;
        }
        const token = bearerHeader.split(' ')[1];

        if (typeof token === 'undefined') {
            return false;
        }

        return token;
    }
}

module.exports = SaucesController;