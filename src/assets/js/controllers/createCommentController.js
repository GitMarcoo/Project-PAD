/**
 * @class CreateCommentController this class is used to create a comment on a forum post or on another comment
 *
 * @extends Controller
 * @author Marco de Boer
 */

import {Controller} from "./controller.js";
import {forumMessageRepository} from "../repositories/forumMessageRepository.js";
import {App} from "../app.js";
import {forumMessageController} from "./forumMessageController.js";
import {AlertController} from "./alertController.js";

export class CreateCommentController extends Controller {
    #htmlFilePathCommentView = "html_views/_addcomment.html"
    #createCommuntView
    #createCommuntViewTextArea
    #maxCommentLength = 1000;
    #parentcomment
    #fullForumPostRepository
    #forumPostId
    #userId

    /**
     * Constructor for the CreateCommentController
     * @param parentcomment the id of the parentcomment
     * @param forumPostId the id of the forum post
     * @returns {Promise<*>} the view of the create comment page
     * @author Marco de Boer
     */
    constructor(parentcomment, forumPostId) {
        super();
        this.#parentcomment = parentcomment;
        this.#userId = App.sessionManager.get("userId");
        this.#forumPostId = forumPostId;
        this.#fullForumPostRepository = new forumMessageRepository();
        return this.#setupView();
    }

    /** Setupview creates the html and adds eventlisteners to the button
     *
     * @returns {Promise<*>} the view of the create comment page
     *
     * @author Marco de Boer
     */
    async #setupView() {
        const template = document.createElement('template');
        const response = await fetch(this.#htmlFilePathCommentView);
        if (response.ok) {
            template.innerHTML = await response.text();
        }
        this.#createCommuntView = template.content.querySelector("form");
        this.#createCommuntViewTextArea = this.#createCommuntView.querySelector("textarea");

        this.#createCommuntView.querySelector("button").addEventListener("click", (event) => {
            this.#createComment(event)
        });
        this.#createCommuntViewTextArea.addEventListener("input", (event) => {
            this.#changeCharacterCounter()
        });


        return this.#createCommuntView;
    }

    /**
     * Changes the character counter
     * @returns {Promise<void>}
     * @author Marco de Boer
     */
    async #changeCharacterCounter() {
        const characterCounter = this.#createCommuntView.querySelector(".characterCounter");
        const chardiv = this.#createCommuntView.querySelector(".characters")

        characterCounter.innerHTML = this.#createCommuntViewTextArea.value.length;
        if (this.#createCommuntViewTextArea.value.length > this.#maxCommentLength) {
            chardiv.querySelectorAll("span").forEach(span => span.style.color = "red")
        } else {
            chardiv.querySelectorAll("span").forEach(span => span.style.color = "black")
        }
    }

    /**
     * Creates a comment and sends it to the server
     * @param event the event of the button
     * @returns {Promise<void>}
     *
     * @author Marco de Boer
     */

    async #createComment(event) {
        if (!App.sessionManager.get("userId")) {
            document.location.href = "?#login"
            AlertController.show("Log in om een reactie te plaatsen!", "danger");
        } else {
            event.preventDefault();
            let response
            if (this.#createCommuntViewTextArea.value.length > this.#maxCommentLength || this.#createCommuntViewTextArea.value.length === 0) {
                AlertController.show("Je comment is te lang of niet ingevuld!", "danger");
            } else {
                try {
                    response = await this.#fullForumPostRepository.create(this.#forumPostId, this.#createCommuntViewTextArea.value, this.#parentcomment, this.#userId);
                } catch (e) {
                    if (e.code === 400){
                        AlertController.show("Probleem met de server!", "danger");
                    }
                }
            }
            if (response.message === "Message added") {
                AlertController.show("Je comment is geplaatst!", "success");
                this.#createCommuntViewTextArea.value = "";
                window.location.reload();
            } else {
                AlertController.show("U comment is voldoet niet aan de eisen. Maak een aanpassing en probeer het opniew!", "danger")
            }
        }
    }


}