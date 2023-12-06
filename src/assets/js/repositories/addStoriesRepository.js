/**
 * Repository for addStories
 * @author Beyza Kurt
 */

import {NetworkManager} from "../framework/utils/networkManager.js";

export class addStoriesRepository {
    #route
    #networkManager

    constructor() {
        this.#route = "/add_story"
        //The network manager used for making requests to the server.
        this.#networkManager = new NetworkManager();
    }

    /**
     * this function
     * @param title of the new story
     * @param text of the new story
     * @param location of the new story
     * @param image of the new story
     */
    async createStory(title, text, location, image, userId, date){
        return await this.#networkManager.doRequest(this.#route, "POST", {title: title, text: text, location: location, image: image, userId: userId, date: date})
    }

    getLocations(){
        return this.#networkManager.doRequest("/locations", "GET")
    }


}