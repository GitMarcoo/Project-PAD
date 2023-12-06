/**
 *
 */
class forumRoute {
    #errorCodes = require("../framework/utils/httpErrorCodes")
    #databaseHelper = require("../framework/utils/databaseHelper")
    #app

    /**
     * @param app - ExpressJS instance(web application) we get passed automatically via app.js
     * Important: always make sure there is an app parameter in your constructor!
     */
    constructor(app) {
        this.#app = app;

        //call method per route for the users entity
        this.#getForum()
        this.#getForumPost()
        this.#postForumMessage();
        this.#postForumMessageComment();
        this.#getForumPostComments();
        this.#getForumComments()
    }

    /**
     * Get messages from the database
     * @author Salma Achahbar
     */
    #getForum() {
        this.#app.get("/messages", async(req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: `SELECT idMessage, title, fm.text, fm.date, username, COUNT(fmc.idforummessage) as commentCount
                            FROM forummessage fm
                                     INNER JOIN users u ON fm.userId = u.id
                                     LEFT JOIN forummessagecomment fmc ON fm.idMessage = fmc.idforummessage
                            GROUP BY fm.idMessage, fm.title, fm.text, fm.date, u.username
                            ORDER BY date DESC`
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
                res.render
            } catch (e) {
                // If an error occurs, return a bad request error with the reason for the error
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: "Requested data could not be found"});
            }
        })
    }

    /**
     * Get a specific message from the database by its id
     * @param id - id of the message to get
     * @returns {Promise<*>} - the message with the given id
     * @autor Marco de Boer
     */

    #getForumPost(){
        this.#app.get("/forumpost",async(req,res)=>{
            if (!req.query.id) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: "No id given"});
            }else{
                try{
                    const data = await this.#databaseHelper.handleQuery({
                        query: `SELECT idMessage, title, text, date, username
                            FROM forummessage
                            INNER JOIN users ON forummessage.userId = users.id
                            WHERE idMessage = ?`,
                        values: [req.query.id]
                    });
                    if (data == null){
                        res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: "Requested data could not be found"});
                    }else{
                        res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
                    }
                }catch (e) {
                    res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: "Requested data could not be found"});
                }
            }
        })
    }

    /**
     * Get comments from the database by the id of the message they belong to
     * @param id - id of the message to get the comments from
     * @returns {Promise<*>} - the comments with the given id
     * @autor Marco de Boer
     */

    #getForumPostComments(){
        this.#app.get("/forumpost/comments",async(req,res)=>{
            if (!req.query.id) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: "No id given"});
            }else{
                try{
                    const data = await this.#databaseHelper.handleQuery({
                        query: `SELECT idforummessagecomment, idforummessage, text, date, username, idparentcomment
                            FROM forummessagecomment
                            INNER JOIN users ON forummessagecomment.user = users.id
                            WHERE idforummessage= ?
                            ORDER BY date ASC`,
                        values: [req.query.id]
                    });
                    if (data == null){
                        res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: "Requested data could not be found"});
                    }else{
                        res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
                    }
                }catch (e) {
                    res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: "Requested data could not be found"});
                }
            }
    })
    }

    /**
     * Set up an endpoint for creating a new forum message via a POST request.
     * @author Saleeman
     */
    #postForumMessage(){
        this.#app.post("/createMessage/:userId", async (req, res) => {
            const userId = req.params.userId;
            const messageTitle = req.body.title;
            const messageText = req.body.text;
            try {
                // Insert all fields including the file URL into the database
                await this.#databaseHelper.handleQuery({
                    query: "INSERT INTO forummessage(title, text, userId) VALUES (?, ?,?)",
                    values: [messageTitle, messageText, userId]
                });

                res.status(200).json({message: "Message added"});
            } catch (e) {
                // If an error occurs, return a bad request error with the reason for the error
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }

    /**
     * Retrieves the forum comments from the server.
     * This function sets up a route handler for the "/forum/comments" endpoint using the HTTP GET method. When a request is made to
     * this endpoint, the function queries the database to retrieve all forum message comments. If the data is found, it is sent
     * as a JSON response with an HTTP 200 OK status code. If the data is not found, a JSON response with a status code indicating
     * a bad request is sent. If an error occurs during the process, a JSON response with a status code indicating a bad request is sent.
     * @function #getForumComments
     * @author saleeman
     */
    #getForumComments() {
        this.#app.get("/forum/comments", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: `SELECT *
                            FROM forummessagecomment
                            `
                });
                if (data == null) {
                    res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: "Requested data could not be found"});
                } else {
                    res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
                }
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: "Requested data could not be found"});
            }
        })
    }
    /**
     * Set up an endpoint for creating a new forum message comment via a POST request.
     * you  need to give the id of the forum the comment is for and the comment itself
     * also you can optionally give the id of the parent comment if it is a reply to another comment
     * @author Marco de Boer
     */

    #postForumMessageComment(){
        this.#app.post("/createcomment/:forumPostId", async (req, res) => {
            const forumPostId = req.params.forumPostId;
            const comment = req.body.comment;
            if (!comment) res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: "No comment given"});

            const parentCommentId = req.body.parentCommentId;
            const user = req.body.user;
            try {
                // Insert all fields including the file URL into the database
                await this.#databaseHelper.handleQuery({
                    query: "INSERT INTO forummessagecomment(idforummessage, text, idparentcomment, user) VALUES (?, ?,?,?)",
                    values: [forumPostId, comment, parentCommentId, user]
                });

                res.status(200).json({message: "Message added"});
            } catch (e) {
                // If an error occurs, return a bad request error with the reason for the error
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }


}

module.exports = forumRoute;