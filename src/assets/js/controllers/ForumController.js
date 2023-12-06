/**
 * Controller for forum
 */
import {Controller} from "./controller.js";
import {forumRepository} from "../repositories/forumRepository.js";
import {MessageHTMLBuilder} from "../framework/utils/messageHTMLBuilder.js";
import {App} from "../app.js";
import {forumStoryController} from "./ForumStoryController.js";
import {SortData} from "../framework/utils/sortData.js";
import {AlertController} from "./alertController.js";


export class forumController extends Controller {
    #forumRepository
    #forumView
    #messageHTMLBuilder
    #messages

    constructor() {
        super();
        this.#forumRepository = new forumRepository();

        this.#messageHTMLBuilder = new MessageHTMLBuilder();

        this.#setupView();
    }

    async #setupView(){
        this.#forumView = await super.loadHtmlIntoContent("html_views/forum.html");
        // this.#forumView.querySelector("#messagesButton").style.backgroundColor = "#DEDEDE";
        // this.#forumView.querySelector("#storiesButton").style.boxShadow = "2px 2px 5px #6C6C6C";

        this.#messages = await this.#forumRepository.get();
        this.#handleSorting(this.#forumView.querySelector("#active"));
        // this.#forumView.querySelector("#messagesButton").href

        this.#forumView.querySelector(".createButton").addEventListener("click",(e) =>{
            const clickedAncher = e.target;
            const controller = clickedAncher.dataset.controller;
            App.loadController(controller);
        })
        this.#initializeFilerListeners();

        // this.#forumView.querySelector("#storiesButton").addEventListener("click", () =>{
        //
        //     App.loadController(new forumStoryController());
        // })

    }

    /**
     * Showing all the messages on the forum
     * @param messages messages from the db
     * @author Salma Achahbar
     */
    async #showForum(messages){
        const forumBoard = this.#forumView.querySelector(".messages");

        for (let message of messages){
            forumBoard.appendChild(await this.#messageHTMLBuilder.buildMessageTemplate(message))
        }
    }


    /**
     * Initializes the filer listeners.
     * Attaches click event listeners to filter buttons and handles the sorting of items based on the clicked button.
     * @author Saleeman
     */
    #initializeFilerListeners(){
        const filterButtons = this.#forumView.querySelectorAll(".filter-btn");

        filterButtons.forEach((button)=>{
            button.addEventListener("click", (e)=>{
                button = e.target;
                this.#removeStyle()
                this.#handleSorting(button);
            })
        })

    }

    /**
     * Handles sorting based on the clicked button.
     * This function is responsible for performing sorting operations based on the clicked button. It retrieves the comments,
     * determines the type of filter and target, creates a new instance of SortData, updates the UI, and applies the "sorting-active"
     * class to the clicked button.
     * @param button
     * @returns {Promise<void>}
     * @author Saleeman
     */
    async #handleSorting(button){
        let buttonId = button.id
        const showmessages = this.#forumView.querySelector('#message');
        let typeOfFitler;
        let target,newData,comments;

        try{
           comments = await this.#forumRepository.getComments();
        }catch (e) {
            AlertController.show("Kan comments niet opvragen, probeer het straks opnieuw", "danger")
        }

        switch (buttonId) {
            case "oldNew":
                typeOfFitler = "old-new";
                target = "date";
                break;
            case "newOld":
                typeOfFitler = "new-old";
                target = "date";
                break;
            case "mostComments":
                typeOfFitler = "mostComments-least";
                target = null;
                break;
            case "active":
                typeOfFitler = "active-forum";
                target = null;
                break;
        }

        newData = new SortData(typeOfFitler, this.#messages, target,comments || []);
        showmessages.innerHTML = "";
        this.#showForum(newData)
        button.classList.add("sorting-active");
    }

    /**
     * Removes the "sorting-active" class from filter buttons.
     * This function iterates over the filter buttons and removes the "sorting-active" class from buttons that have it.
     * @private
     * @function #removeStyle
     * @author saleeman
     */
    #removeStyle(){
        const filterButtons = this.#forumView.querySelectorAll(".filter-btn");

        filterButtons.forEach((button)=>{
            if (button.classList.contains("sorting-active")){
                button.classList.remove("sorting-active");
            }
        })
    }
}