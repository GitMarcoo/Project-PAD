export class MessageHTMLBuilder {
    #htmlFilePathMessageView

    constructor() {
        this.#htmlFilePathMessageView = "../../../../html_views/_forumMessageView.html"
    }
    async buildMessageTemplate(message){
        const template = document.createElement('template');
        const response = await fetch(this.#htmlFilePathMessageView);
        if(response.ok){
            template.innerHTML = await response.text();
        }

        let clone = template.content.cloneNode(true);
        let messagehtml = clone.querySelector("a");
        messagehtml.href = `?id=${message.idMessage}#forumPost`;

        messagehtml = await this.#buildForum(clone, message)

        return messagehtml
    }

    async #buildForum(htmlclone, message){
        htmlclone.querySelector("article").id = "story" + message.idMessage;
        htmlclone.querySelector("#title").innerHTML = message.title;
        let date = new Date(message.date).toLocaleDateString();
        htmlclone.querySelector("h6").innerText = ` ${message.username}, ${date}` ;
        htmlclone.querySelector("p").innerHTML = message.text;
        htmlclone.querySelector("#commentamount").innerHTML = message.commentCount;

        return htmlclone;
    }
}