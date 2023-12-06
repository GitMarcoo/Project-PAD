/**
 * This class contains ExpressJS routes specific for uploading a file. This is an example to use.
 * this file is automatically loaded in app.js
 * multer is used for parsing formdata
 * @author Pim Meijer
 */
const fs = require("fs");

class UploadFileRoute {
    #errorCodes = require("../framework/utils/httpErrorCodes")
    #multer = require("multer");
    #app
    #databaseHelper;

    /**
     * @param app - ExpressJS instance(web application) we get passed automatically via app.js
     * Important: always make sure there is an app parameter in your constructor!
     */
    constructor(app) {
        this.#app = app;
        this.#databaseHelper = require("../framework/utils/databaseHelper")

        this.#uploadFile()
    }

    /**
     * Example route for uploading files
     * @private
     */
    #uploadFile() {
        this.#app.post("/upload", this.#multer().single("sampleFile"), (req, res) => {

            if (!req.file) {
                return res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: "No file was uploaded."});
            }

            //get the buffer of the file
            const sampleFile = req.file.buffer;
            //unique name for the file
            const d = new Date();
            const filename = d.getDate() + d.getMonth() + d.getFullYear() + d.getDay() + d.getMilliseconds();
            fs.writeFile(wwwrootPath + "/uploads/" + filename + ".jpg", sampleFile, async (err) => {
                if (err) {
                    console.log(err)
                    return res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: err});
                }


                //respond with the unique file name
                return res.status(this.#errorCodes.HTTP_OK_CODE).json(filename);

            });
        });
    }
}

module.exports = UploadFileRoute