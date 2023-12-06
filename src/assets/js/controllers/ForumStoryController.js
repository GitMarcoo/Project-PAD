/**
 * Controller for forum
 */
import {Controller} from "./controller.js";
import {allStoriesRepository} from "../repositories/allStoriesRepository.js";
import {App} from "../app.js";
import {ForumStoriesHTMLBuilder} from "../framework/utils/ForumStoriesHTMLBuilder.js";
import {forumController} from "./ForumController.js";


export class forumStoryController extends Controller {
    #allStoriesRepository
    #forumView
    #forumStoriesHTMLBuilder


    constructor() {
        super();
        this.#allStoriesRepository = new allStoriesRepository();

        this.#forumStoriesHTMLBuilder = new ForumStoriesHTMLBuilder();

        this.#setupView();
    }

    async #setupView(){
        this.#forumView = await super.loadHtmlIntoContent("html_views/forum.html");
        // this.#forumView.querySelector("#storiesButton").style.backgroundColor = "#DEDEDE";
        // this.#forumView.querySelector("#messagesButton").style.boxShadow = "2px 2px 5px #6C6C6C";

        const stories = await this.#allStoriesRepository.get();
        await this.#showForum(stories);
        // this.#forumView.querySelector("#messagesButton").href

        this.#forumView.querySelector(".createButton").addEventListener("click",(e) =>{
            const clickedAncher = e.target;
            const controller = clickedAncher.dataset.controller;
            App.loadController(controller);
        })

        // this.#forumView.querySelector("#messagesButton").addEventListener("click", () =>{
        //     App.loadController(new forumController());
        // })

    }

    /**
     * Showing all the messages on the forum
     * @author Salma Achahbar
     * @param stories
     */
    async #showForum(stories){
        const forumBoard = this.#forumView.querySelector(".messages");

        for (let story of stories){
            forumBoard.appendChild(await this.#forumStoriesHTMLBuilder.buildForumStoryTemplate(story))
        }
    }

}