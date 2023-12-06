/**
 * @class CommentHTMLBuilder is used for building the html for the comments
 * @author Marco de Boer
 */

export class CommentHTMLBuilder {
    #htmlFilePathCommentView


    constructor() {
        this.#htmlFilePathCommentView = "../../../../html_views/_comment.html"
    }

    /**
     * @public function buildComment is used for building the html for the comments
     * comment(idforummessagecomment, idforummessage ,text, date, idparentcomment)
     * @param comment is the comment you want to build the html for
     * @param parentamount is the amount of parents the comment has
     * @returns {Promise<HTMLDivElement>} a div element with comment html
     * @author Marco de Boer
     */

    async buildComment(comment, parentamount){
        const template = document.createElement('template');
        const response = await fetch(this.#htmlFilePathCommentView)
        if (response.ok) {
            template.innerHTML = await response.text();
        }

        let clone = template.content.cloneNode(true);
        let commenthtml = clone.querySelector("div");
        commenthtml.id = "c" + comment.idforummessagecomment;
        if (comment.idparentcomment === null){
            commenthtml.classList.add("margintop");
        }else {
            for (let i = 0; i < parentamount; i++){
                let line = commenthtml.querySelector(".vertical").cloneNode(true);
                commenthtml.querySelector(".vertical").insertAdjacentElement("afterend", line);
            }
            commenthtml.querySelectorAll(".vertical").forEach((element) => {element.classList.add("hidden")})
            commenthtml.querySelectorAll(".vertical")[parentamount].classList.add("smallmargintop");
            commenthtml.querySelectorAll(".vertical")[parentamount].classList.remove("hidden");
            commenthtml.querySelector(".commentdiv1").classList.add("smallmargintop");
        }

        commenthtml = await this.#fillInComment(commenthtml, comment)

        return commenthtml;
    }

    /**
     * @private function fillInStory is used for filling in the comment with the data from the server
     * @param htmlclone is the html clone of the template
     * @param comment is the comment you want to fill in in this is the data for it
     * @returns {Promise<*>} the htmlclone with the data filled in
     *
     * @author Marco de Boer
     */
    async #fillInComment(htmlclone, comment){
        const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
        htmlclone.querySelector(".commentdate2").innerHTML = new Date(comment.date).toLocaleDateString('nl-NL', options);
        htmlclone.querySelector(".commentusername").innerText = comment.username;
        htmlclone.querySelector(".commenttext").innerText = comment.text


        return htmlclone;
    }


}