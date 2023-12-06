/**
 * This class contains ExpressJS routes specific for the full stories entity
 * @author Salma Achahbar
 */
class fullStoriesRoute {
    #errorCodes = require("../framework/utils/httpErrorCodes")
    #databaseHelper = require("../framework/utils/databaseHelper")
    #app

    /**
     * @param app - ExpressJS instance(web application) we get passed automatically via app.js
     * Important: always make sure there is an app parameter in your constructor!
     */
    constructor(app) {
        this.#app = app;

        this.#getFullStories()
    }

    /**
     * GET request to retrieve all stories from the database and returns the result
     * @author Salma Achahbar
     * @private
     */
    #getFullStories() {
        this.#app.get("/fullStories", async(req, res) => {
            try {
                let id = req.query.id; // haal de waarde van 'id' op uit de query parameters
                let query = `SELECT idStory, title, text, date, location, image, users.username
                              FROM story
                              INNER JOIN users ON story.user = users.id`;
                if (id) {
                    query += ` WHERE idStory = ${id}`; // voeg een WHERE-clausule toe om alleen het gewenste verhaal op te halen
                }
                const data = await this.#databaseHelper.handleQuery({
                    query: query
                });
                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            }
            catch(e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: "Requested data could not be found"})
            }
        })
    }
}

module.exports = fullStoriesRoute;