import {fullStoriesRepository} from "../repositories/fullStoriesRepository.js";
import {Controller} from "./controller.js";

/**
 * This controller shows the story after a user clicked on it.
 * @author Salma Achahbar
 */
export class fullStoriesController extends Controller {
    #fullStoriesRepository
    #fullStoriesView

    constructor() {
        super();
        this.#fullStoriesRepository = new fullStoriesRepository();

        this.#setupView();
    }

    /**
     * Loads content of fullStories html into the index.html .content div
     * @returns {Promise<void>}
     * @private
     */
    async #setupView(){
        this.#fullStoriesView = await super.loadHtmlIntoContent("html_views/fullStories.html");

        let params = new URLSearchParams(window.location.search);
        let id = params.get("id");
        const stories = await this.#fullStoriesRepository.get(id); // geef de 'id'-parameter door aan de 'get'-functie
        this.#showStories(stories);
    }

    /**
     * Gets the id and goes to the story that the user clicked on
     * @author: Salma Achahbar
     * @param stories stories from the database
     */
    #showStories(stories) {
        let currentStory = stories[0];

        document.getElementById("titel").innerHTML = currentStory.title;
        document.getElementById("text").innerHTML = currentStory.text;

        let date = new Date(currentStory.date).toLocaleDateString();
        document.getElementById("date").innerHTML = `Geschreven door: ${currentStory.username} <br>   op: ${date}`;

        if(currentStory.image == null || currentStory.image === "/uploads/undefined.jpg"){
            document.getElementById("image").style.display = "none";
        } else {
            document.getElementById("image").setAttribute('src', currentStory.image);
            document.getElementById("image").onerror = function() {
                this.style.display='none';
            };
        }


    }
}