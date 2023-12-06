/**
 * This class contains ExpressJS routes specific for the addStorie entity
 * this file is automatically loaded in app.js
 *
 * @author Marco de Boer
 */



class allStoriesRoute {
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
        this.#baseURL = "/stories"

        //call method per route for the rooms entity
        this.#getStories()
        this.#getStoryByLocation();
        this.#getCountOfStories()

    }


    /**
     * handles the GET request from client and retrieves all the stories from the DB, for the request there can also
     * be given a parameter order with which the query get sorted.
     * @private
     * @author Marco de Boer
     */



    #getStories() {
        this.#app.get(this.#baseURL, async(req, res) =>{
            let query;
            let baseQuery = `SELECT *
                             FROM story
                             ORDER BY story.date `
            //if link contains ?order="ASC" then req.query.order will read if it contains asc and then make the
            //order of dates get sorted by ascending in the query
            if (req.query.order === "asc") {
                query = baseQuery + "ASC";
            }
            //else the query will default to descending
            else {
                query = baseQuery + "DESC";
            }




            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: query
                });
                    res.status(this.#errorCodes.HTTP_OK_CODE).json(data);

            } catch(e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })

    }

    /**
     This method handles GET requests to retrieve stories from the database based on a given location.
     The stories are retrieved from the 'story' table in the database and returned as a JSON object.
     @author saleeman
     */
    #getStoryByLocation(){
        this.#app.get(`${this.#baseURL}/:location`, async (req, res) => {
            try {
                // Extract the 'location' parameter from the request
                let location = req.params.location;
                // Query the database for stories based on the location parameter
                let data = await this.#databaseHelper.handleQuery({
                    query: "SELECT * FROM story WHERE location = ?",
                    values: [location]
                })
                if (data.length === 0){
                    // Return an error
                    res.status(this.#errorCodes.BAD_REQUEST_CODE).json({
                        error: "location not found",
                        location: location
                    })
                }else {
                    // Return the retrieved stories as a JSON object
                    res.status(this.#errorCodes.HTTP_OK_CODE).json(data)
                }
            } catch(e) {
                // Return an error if the database query fails
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json(e)
            }
        });
    }

    /**
     This method handles GET requests to retrieve the count of stories from the database based on a given location.
     @author saleeman
     */
    #getCountOfStories(){
        this.#app.get(`${this.#baseURL}/:location/count`, async (req, res) => {
            try {
                // Extract the 'location' parameter from the request
                let location = req.params.location;
                // Query the database for the count of stories based on the location parameter
                let data = await this.#databaseHelper.handleQuery({
                    query: "SELECT COUNT(idStory) AS count FROM story WHERE location=?",
                    values: [location]
                })
                // Return the retrieved stories as a JSON object
                res.status(this.#errorCodes.HTTP_OK_CODE).json(data)
            } catch(e) {
                // Return an error if the database query fails
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json(e)
            }
        })
    }

}

module.exports = allStoriesRoute