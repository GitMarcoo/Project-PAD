import {NetworkManager} from "../framework/utils/networkManager.js";

export class forumRepository {
    #route
    #networkManager

    #messages

    constructor() {
        this.#route = "/messages"
        this.#networkManager = new NetworkManager();

    }

    /**
     * Get all messaged from the database
     * @returns {Promise<*>}
     * @author Salma Achahbar
     */
    async get() {
        this.#messages = await this.#networkManager.doRequest(`${this.#route}`, "GET",)
        return this.#messages;
    }


    /**
     * Send a POST request to create a new message for the specified user.
     * @param {string} userId - The ID of the user to create the message for.
     * @param {string} title - The title of the new message.
     * @param {string} text - The text content of the new message.
     * @returns {Promise<void>} A Promise that resolves when the request is complete.
     * @author saleeman
     */
    async postMessage(userId, title, text) {
        return await this.#networkManager.doRequest(`/createMessage/${userId}`, "POST",{title: title, text: text})
    }

    /**
     * get all the comments in the database
     * @returns {Promise<*>}
     */
    async getComments(){
        return await this.#networkManager.doRequest(`/forum/comments`, "GET")
    }


}