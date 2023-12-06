/**
 * This class contains ExpressJS routes specific for the mapRoute entity
 * this file is automatically loaded in app.js
 *
 * @author Marco de Boer
 */

class mapRoute {
    #errorCodes = require("../framework/utils/httpErrorCodes")
    #databaseHelper = require("../framework/utils/databaseHelper")
    #app
    #baseURL

    /**
     * @param app - ExpressJS instance(web application) we get passed automatically via app.js
     * Important: always make sure there is an app parameter in your constructor!
     */
    constructor(app) {
        this.#app = app;
        this.#baseURL = "/map"

        //call method per route for the rooms entity
        this.#getMapLocations()
    }


    /**
     * handles the GET request from client and retrieves all the mapLocations from the DB.
     * @private
     * @author Marco de Boer
     */



    #getMapLocations() {
        this.#app.get(this.#baseURL, async(req, res) =>{
            let query = `SELECT m.*, COUNT(s.idStory) AS story_count
                             FROM maplocation m
                                      LEFT JOIN story s ON s.location = m.name
                             GROUP BY m.idmaplocation;`

            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: query
                });
                    //just give all data back as json, could also be empty
                    res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch(e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }



}

module.exports = mapRoute