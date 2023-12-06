import {Controller} from "./controller.js";
import {forumMessageRepository} from "../repositories/forumMessageRepository.js";
import {CommentController} from "./commentController.js";
import {CreateCommentController} from "./createCommentController.js";

/**
 * This controller shows the Forum Post after a user clicked on it.
 * @author Marco de Boer
 */
export class forumMessageController extends Controller {
    #fullForumPostRepository
    #fullForumPostView
    #forumPostId
    #maxCommentLength = 1000;
    #comment
    #parentcomment

    constructor() {
        super();
        this.#fullForumPostRepository = new forumMessageRepository();
        this.#forumPostId = new URLSearchParams(window.location.search).get("id");
        this.#setupView();
    }

    /**
     * Loads content of fullStories html into the index.html .content div
     * also adds eventlistener to the back button
     * if the forum post doesn't exist, it will show a 404 page
     * @author Marco de Boer
     */
    async #setupView(){
        const forumPost = await this.#fullForumPostRepository.get(this.#forumPostId);

        if (forumPost[0] === undefined) {
            this.#fullForumPostView = await super.loadHtmlIntoContent("html_views/404.html");
        }else{
            this.#fullForumPostView = await super.loadHtmlIntoContent("html_views/fullForumMessage.html");
            this.#comment = this.#fullForumPostView.querySelector("#comment")

            this.#fullForumPostView.querySelector("#backButton").addEventListener("click", (event)=>{this.#backButton(event)});
            this.#showForumPost(forumPost[0]);
            this.#loadComments();

            let createCommentController = new CreateCommentController(null, this.#forumPostId);
            createCommentController.then((view) => {
                this.#fullForumPostView.querySelector("hr").insertAdjacentElement("beforebegin",view);
            });
        }
    }

    /**
     * Showing the full forum post
     * @param forumPost forum post from the db
     * @author Marco de Boer
     */
    async #showForumPost(forumPost) {
        this.#fullForumPostView.querySelector("#title").innerHTML = forumPost.title;
        this.#fullForumPostView.querySelector("#text").innerHTML = forumPost.text;
        this.#fullForumPostView.querySelector("#postdate").innerHTML = new Date(forumPost.date).toLocaleDateString();
        this.#fullForumPostView.querySelector("#username").innerHTML = forumPost.username;

    }

    /**
     * Goes back to the forum page
     * @param event
     * @author Marco de Boer
     */
    async #backButton(event){
        event.preventDefault();
        window.location.href = "#forum"
    }

    /**
     * Loads the comments of the forum post
     * @returns {Promise<void>}
     * @author Marco de Boer
     */
    async #loadComments(){
        const comments = await this.#fullForumPostRepository.getComments(this.#forumPostId);
        this.#fullForumPostView.querySelector("#commentamount").innerHTML = comments.length;
        const commentSection = this.#fullForumPostView.querySelector("#comments");
        commentSection.innerHTML = "";
        await this.#loadComments1(comments, commentSection);
        await this.#loadComments2(comments, commentSection);
    }

    /**
     * Loads the comments of the forum post that are not a reply to another comment
     * @param comments comments from the db
     * @param commentSection section where the comments will be placed
     * @returns {Promise<void>}
     * @author Marco de Boer
     */
    async #loadComments1(comments, commentSection){
        for (let comment of comments.filter(comment => comment.idparentcomment === null)) {
            let commentcontroller = new CommentController(comment, null)
            commentcontroller.then(result => {
                commentSection.append(result)
            })
        }
    }

    /**
     * Loads the comments of the forum post that are a reply to another comment
     * @param comments comments from the db
     * @returns {Promise<void>}
     * @author Marco de Boer
     */
    async #loadComments2(comments){
            const commentSection = this.#fullForumPostView.querySelector("#comments");
            for (let comment of comments.filter(comment => comment.idparentcomment !== null)) {
                try {
                    let searchparentcomment = comment;
                    let parentamount = 0;
                    //searches for the parent comment and counts how many parents it has
                    while(searchparentcomment.idparentcomment !== null){
                        searchparentcomment = comments.find(comment => comment.idforummessagecomment === searchparentcomment.idparentcomment);
                        parentamount++;
                    }
                    //creates the comment
                    let commentcontroller2 = new CommentController(comment, parentamount)
                    commentcontroller2.then(result => {
                        let parentcomment = commentSection.querySelector(`#c${comment.idparentcomment}`);
                        parentcomment.insertAdjacentElement('afterend',result)
                    })
                }catch (e) {
                    console.log("parent comment not found");
                }
            }

    }
}