/**
 * Repository for allStories
 *
 * @author Marco de Boer
 */
import {NetworkManager} from "../framework/utils/networkManager.js";

export class allStoriesRepository {
    //# is a private field in Javascript
    #route
    #networkManager

    constructor() {
        this.#route = "/stories"
        this.#networkManager = new NetworkManager();
    }


    /**
     * Async function to get all the stories there are from the DB it also saves them in the repository
     * @returns {Promise<*>} all the stories
     */
    async get() {
        return await this.#networkManager.doRequest(`${this.#route}?order="desc"`, "GET",)
    }

    /**
     * Function to get stories from specific location
     * @author Saleeman
     * @param location stories from this location
     * @returns {Promise<*>}
     */
    async getStoryByLocation(location) {
        return await this.#networkManager.doRequest(`${this.#route}/${location}`, "GET",);
    }
    async getCountOfStories(location) {
        return await this.#networkManager.doRequest(`${this.#route}/${location}/count`, "GET",);
    }


    async create() {

    }

    async delete() {

    }

    async update() {

    }


}