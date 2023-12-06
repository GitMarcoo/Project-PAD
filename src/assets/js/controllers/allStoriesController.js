/** This controller manages the allStories page. It handles loading in
 *  all the stories from the DB
 *
 * @author Marco de Boer
 */


import {Controller} from "./controller.js";
import {allStoriesRepository} from "../repositories/allStoriesRepository.js";
import {TagManager} from "../framework/utils/tagManager.js";
import {StoryHTMLBuilder} from "../framework/utils/storyHTMLBuilder.js";
import {App} from "../app.js";
import {AlertController} from "./alertController.js";
import {SortData} from "../framework/utils/sortData.js";

export class AllStoriesController extends Controller {
    #allStoriesRepository
    #allStoriesView
    #tagManager
    #storieHTMLBuilder
    #chunk
    #chunksize
    #filteredStories
    #scrollPosition
    #storieBoardCleared
    #allStoriesLoaded
    #allStoriesFromDB
    #loadedStoryIds
    #loadingStories


    constructor() {
        super();
        this.#chunk = 0;
        this.#chunksize = 10;
        this.#allStoriesLoaded = false;
        this.#storieBoardCleared = false;
        this.#allStoriesRepository = new allStoriesRepository();
        this.#tagManager = new TagManager();

        this.#storieHTMLBuilder = new StoryHTMLBuilder();




        this.#setupView();


    }

    /**
     * Loads content of allStories html into the index.html .content div
     * @returns {Promise<void>}
     */

    async #setupView() {
        this.#allStoriesView = await super.loadHtmlIntoContent("html_views/allStories.html");
        this.#initializeListenersForFilters()
        await this.#getStories();

        // this.#allStoriesView.querySelector(".createButton").addEventListener("click", (event) =>{
        //     event.preventDefault()
        //     window.location = '#addStories'
        // });

        document.addEventListener("scroll", (event) => this.#checkScrollHeight(event))
    }


    /**
     * initialize click listeners for the filter buttons. call function based on clicked button
     * @author Saleeman
     */
    #initializeListenersForFilters(){
        const oldNewBtn = this.#allStoriesView.querySelector("#oldNew");
        const newOld = this.#allStoriesView.querySelector("#newOld");

        oldNewBtn.addEventListener("click", () => this.#handleFilter("old-new"))
        newOld.addEventListener("click", ()=> this.#handleFilter("new-old"))
    }

    /**
     * This function checks if the scroll height is at the bottom of the page and if it is it will call the getStories function
     * this is to create a infinite scroll effect
     * @returns {Promise<void>}
     * @author Marco de Boer
     */
    async #checkScrollHeight(){
        if (!this.#allStoriesLoaded){
            this.#scrollPosition = window.innerHeight + window.scrollY;
            const bodyHeight = document.body.offsetHeight;

            if(this.#scrollPosition >= bodyHeight - 50 && this.#loadingStories === false) {
                await this.#showStories();
            }
        }
    }

    /**
     * async function to get the stories from the DB via the repository
     * The response gets saved in const stories and then the handleFilter function gets called
     * to sort the stories based on the type of filter and then the showStories function gets called
     *
     * @author Marco de Boer
     */
    async #getStories() {

        try {
            //await keyword 'stops' code until data is returned - can only be used in async function
            this.#allStoriesFromDB = await this.#allStoriesRepository.get();
            await this.#handleFilter("new-old");
        } catch (e) {
            if (e.code === 400){
                AlertController.show("Fout tijdens ophalen van verhalen", "danger")
            }
            console.log("error while getting stories", e);
        }
    }

    /**
     * This function is used to build the stories using the template and loads it into the html
     * @param stories is the stories you want to build
     * @returns {Promise<void>}
     * @author Marco de Boer
     */
    async #buildStoryUsingTemplate(stories) {
        console.log(stories)
        this.#loadingStories = true;
        const storieBoard = this.#allStoriesView.querySelector('#stories');
        if (!this.#storieBoardCleared){
            storieBoard.innerHTML = "";
            this.#storieBoardCleared = true;
        }
        try{
            for (let story of stories){
                    storieBoard.appendChild(await this.#storieHTMLBuilder.buildStoryUsingTemplate(story))
            }
            this.#loadingStories = false;
        }catch (e) {
            AlertController.show("Er was een probleem met het ophalen van de verhalen", "danger")
            console.log("error while building stories", e);
        }
    }


    /**
     * filter based on the type. Do this by creating a sortData object and show the returned data
     * @param type type of sorting
     * @returns {Promise<void>}
     * @author Saleeman
     */
    async #handleFilter(type){
        const selector = type === "old-new" ? "oldNew" : "newOld";
        const filter = this.#allStoriesView.querySelector(`#${selector}`)
        const nodes = this.#allStoriesView.querySelector(".sorting-buttons").childNodes

        for(let i=0; i<nodes.length; i++) {
            if (nodes[i].nodeName.toLowerCase() === 'button') {
                if (nodes[i].classList.contains("sorting-active")){
                    nodes[i].classList.remove("sorting-active");
                }
            }
        }

        filter.classList.add("sorting-active");
        this.#filteredStories = new SortData(type, this.#allStoriesFromDB, "date");
        this.#allStoriesView.querySelector("#stories").innerHTML = "";
        this.#chunk = 0;
        this.#allStoriesLoaded = false;
        await this.#showStories();
    }


    /**
     * This function is used to show the stories. It will check if the chunksize * chunk is bigger than the length of the stories
     * if it is it will show the allStoriesLoaded message. If not it will call the buildStoryUsingTemplate function
     *
     * @author Marco de Boer
     */

    async #showStories(){
        if ((this.#chunksize * this.#chunk) > this.#allStoriesFromDB.length){
            this.#allStoriesLoaded = true;
            this.#allStoriesView.querySelector("#allStoriesLoaded").classList.toggle("hidden")
        }else if (this.#chunk * this.#chunksize + this.#chunksize - 1 > this.#allStoriesFromDB.length){
           await this.#buildStoryUsingTemplate(this.#filteredStories.slice((this.#chunk * this.#chunksize), this.#allStoriesFromDB.length))
            this.#chunk++;
        } else {
            console.log(`start: ${this.#chunk * this.#chunksize} end: ${this.#chunk * this.#chunksize + this.#chunksize}`);
            await this.#buildStoryUsingTemplate(this.#filteredStories.slice((this.#chunk * this.#chunksize), (this.#chunk * this.#chunksize + this.#chunksize)))
            this.#chunk++;
        }
    }

}