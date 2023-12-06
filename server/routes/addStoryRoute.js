
/**
 * This class defines a route handler for POST requests to the "/addStory" endpoint.
 * It expects the request body to have a "title", "text", and "location" fields,
 * and attempts to insert a new record into the "story" table of the database with those values.
 *
 * @author Beyza Kurt
 */

class addStoryRoute {
    /**
     * Creates an instance of addStoryRoute.
     * @param {Object} app - The express app object to add the route to
     */
    #errorCodes = require("../framework/utils/httpErrorCodes")
    #databaseHelper = require("../framework/utils/databaseHelper")
    #multer = require("multer");
    #app;
    upload;

    constructor(app) {
        this.#app = app;

        this.#postStory();
        this.#getLocations();
    }

    /**
     * Registers the POST request route for adding a new story
     * @private
     */
    #postStory() {

        this.#app.post("/add_story", this.#multer().single("Hello"), async (req, res) => {
            try {
                // Insert all fields including the file URL into the database

                const data = await this.#databaseHelper.handleQuery({
                    query: "INSERT INTO story(title, text, location, image, user, date) VALUES (?, ?, ?, ?,?, ?)",
                    values: [req.body.title, req.body.text, req.body.location, req.body.image, req.body.userId, req.body.date]
                });

                res.status(200).json({message: "Story added successfully."});
            } catch (e) {
                // If an error occurs, return a bad request error with the reason for the error
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }

    #getLocations(){
        this.#app.get("/locations", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT * FROM location"
                });
                res.status(200).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }

}

module.exports = addStoryRoute;
