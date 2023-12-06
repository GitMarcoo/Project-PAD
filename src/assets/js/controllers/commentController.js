/**
 * CommentController is a class that is used to control the comment view and the create comment view
 * @author Marco de Boer
 */

import {Controller} from "./controller.js";
import {CommentHTMLBuilder} from "../framework/utils/commentHTMLBuilder.js";
import {CreateCommentController} from "./createCommentController.js";

export class CommentController extends Controller{
    #forumPostId
    #parentcommentId
    #comment
    #CommentHTMLBuilder
    #commenthtml
    #addcommentviewvisible = false;
    #htmlFilePathCommentView = "html_views/_addcomment.html"
    #parentamount

    /**
     * Constructor for the CommentController
     * @param comment the comment to show
     * @param parentamount the amount of parents the comment has
     * @returns {Promise<*>} the view of the comment
     *
     * @author Marco de Boer
     */
    constructor(comment, parentamount) {
        super();
        this.#comment = comment;
        this.#forumPostId = comment.idforummessage;
        this.#parentcommentId = comment.idparentcomment;
        this.#CommentHTMLBuilder = new CommentHTMLBuilder();
        this.#parentamount = parentamount
        return this.#setupView();
    }

    /**
     * Setupview creates the html and adds eventlisteners to the button
     * @returns {Promise<*>} the view of the comment
     * @author Marco de Boer
     */

    async #setupView(){
        this.#commenthtml = await this.#CommentHTMLBuilder.buildComment(this.#comment, this.#parentamount);
        this.#commenthtml.querySelector(".commentbutton").addEventListener("click", (event)=>{this.#showAddCommentView(event)});
        return this.#commenthtml;
    }

    /**
     * Shows the create comment view by calling the CreateCommentController
     * if the view is already visible it will remove the view
     * @param event the event that triggered the function
     * @returns {Promise<void>}
     * @author Marco de Boer
     */
    async #showAddCommentView(event){
        event.preventDefault();
        if (!this.#addcommentviewvisible){
            let createCommentController = new CreateCommentController(this.#comment.idforummessagecomment, this.#forumPostId);
            createCommentController.then((view)=>{
                this.#commenthtml.insertAdjacentElement('afterend',view);
                this.#addcommentviewvisible = true;

            })
        }else{
            this.#commenthtml.nextElementSibling.remove();
            this.#addcommentviewvisible = false;
        }
    }


}