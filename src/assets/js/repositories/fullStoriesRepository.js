import {NetworkManager} from "../framework/utils/networkManager.js";

/**
 * Repository for fullStories
 * @author Salma Achahbar
 */
export class fullStoriesRepository {

    #route
    #networkManager

    #stories

    constructor() {
        this.#route = "/fullStories"
        this.#networkManager = new NetworkManager();
    }

    /**
     * Get stories from the database
     * @returns {Promise<*>}
     * @author Salma Achahbar
     */
    async get(id) { // voeg een optionele 'id'-parameter toe aan de 'get'-functie
        let path = this.#route;
        if (id) {
            path += `?id=${id}`; // voeg de 'id'-parameter toe aan het pad als deze is opgegeven
        }
        this.#stories = await this.#networkManager.doRequest(path, "GET")
        return this.#stories;
    }

    async create() {

    }

    async delete() {

    }

    async update(id, values = {}) {

    }

}