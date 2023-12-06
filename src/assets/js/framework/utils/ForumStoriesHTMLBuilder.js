export class ForumStoriesHTMLBuilder {
    #htmlFilePathMessageView

    constructor() {
        this.#htmlFilePathMessageView = "../../../../html_views/_forumMessageView.html"
    }
    async buildForumStoryTemplate(story){
        const template = document.createElement('template');
        const response = await fetch(this.#htmlFilePathMessageView);
        if(response.ok){
            template.innerHTML = await response.text();
        }

        let clone = template.content.cloneNode(true);
        let storyhtml = clone.querySelector("a");

        //moet naar post, niet naar hele verhaal. "...#forumPost"
        storyhtml.href = `?id=${story.idStory}#fullStories`;

        storyhtml = await this.#buildForum(clone, story)

        return storyhtml
    }

    async #buildForum(htmlclone, story){
        htmlclone.querySelector("article").id = "story" + story.idStory;
        htmlclone.querySelector("#title").innerHTML = story.title;

        let date = new Date(story.date).toLocaleDateString();
        htmlclone.querySelector("h6").innerText = ` ${story.username}, ${date}` ;
        htmlclone.querySelector("p").innerHTML = story.text;
        htmlclone.querySelector("#commentamount").innerHTML = story.commentCount;

        let text = htmlclone.querySelector("p");
        text.innerHTML = "Bekijk verhaal";
        text.href = `?id=${story.idStory}#fullStories`;

        return htmlclone;
    }
}