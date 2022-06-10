const Multer = require('multer');


class MulterMiddleware
{
    /**
     * The mimes types allowed for images upload.
     *
     * @property {array} ALLOWED_MIME_TYPES
     */
    ALLOWED_MIME_TYPES = [
        'image/jpg',
        'image/jpeg',
        'image/png'
    ];

    /**
     * The Multer contructor.
     */
    constructor()
    {
        const options = {
            storage: this.storage(),
            fileFilter: (req, file, cb) => {
                // We check that the mimes type is allowed.
                if (this.ALLOWED_MIME_TYPES.indexOf(file.mimetype) === -1) {
                    cb(null, false);
                } else {
                    cb(null, true);
                }
            }
        }
        // Create the Multer instance.
        this._multer = Multer(options);
    }

    /**
     * Handle the multer process for the "image" field.
     *
     * @returns {RequestHandler} The request from Express.
     */
    create()
    {
        return this._multer.single('image');
    }

    /**
     * Function to create a multer diskstorage with it's configuration.
     *
     * @returns {StorageEngine} Return a storage engine with its configuration.
     */
    storage()
    {
        return Multer.diskStorage({
            destination: function (req, file, cb) {
              cb(null, 'images');
            },
            filename: function (req, file, cb) {
                const name = file.originalname.split(' ').join('_'); // Replace space from the name.
                const prefix = Date.now();

                cb(null, `${prefix}-${name}`); // Extension is included in name.
            }
        });
    }
}

module.exports = MulterMiddleware;