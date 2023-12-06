import {NetworkManager} from "../framework/utils/networkManager.js";

export class MapRepository {
    #route
    #networkManager

    constructor() {
        this.#route = "/map";
        this.#networkManager = new NetworkManager();
    }

    /**
     * Async function to get all the stories there are from the server and returns the response
     * @returns {Promise<*>} response from the server
     * @author Marco de Boer
     */
    async get() {
        return await this.#networkManager.doRequest(this.#route, "GET");
    }


    async create() {

    }

    async delete() {

    }

    async update() {

    }

}