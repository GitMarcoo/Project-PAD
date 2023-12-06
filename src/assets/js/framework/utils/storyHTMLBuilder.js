/**
 * This class is for building the Storie HTML. It uses the tagManager
 * to add the tags.
 *
 * @author Marco de Boer
 */

import {TagManager} from "./tagManager.js";

export class StoryHTMLBuilder {
    #tagManager
    #htmlFilePathStoryView
    #htmlFilePathStoryViewWithoutImage

    constructor() {
        this.#tagManager = new TagManager();
        this.#htmlFilePathStoryView = "../../../../html_views/_storyView.html"
        this.#htmlFilePathStoryViewWithoutImage = "../../../../html_views/_storyViewWithoutImage.html"

    }

    /**
     * BuildStoriesUsingTemplate is used to create the html and add the classes for the storie.
     * How it works is you send a story to this function and gives you a div back with the story in it.
     * with html and css. It gets the html from the _storyView.html file or _storyViewWithoutImage.html
     * @param story is a JSON from objects with the attributes you get from the server
     * Stories(idStories, titel, createdDateTime, text, img)
     * @returns {Promise<HTMLDivElement>} a div element with all the stories
     *
     * @author Marco de Boer
     */

    async buildStoryUsingTemplate(story){
        const template = document.createElement('template');
        const response = await fetch(this.#htmlFilePathStoryView)
        if (response.ok){
                template.innerHTML = await response.text();
        } else {
            console.log("Error loading html file _storyView.html")
            return false;
        }


        let clone = template.content.cloneNode(true);
        let storyhtml = clone.querySelector("a");
        storyhtml.addEventListener("click", (event) => {
            window.location = `?id=${story.idStory}#fullStories`;
        })

        storyhtml = await this.#fillInStory(storyhtml, story)
        return storyhtml;
    }

    /**
     * @private function fillInStory is used for filling in the story with the data from the server
     * @param htmlclone is the html clone of the template
     * @param story is the story you want to fill in in this is the data for it
     * @returns {Promise<*>} the htmlclone with the data filled in
     *
     * @author Marco de Boer
     */
    async #fillInStory(htmlclone, story){
        htmlclone.querySelector("article").id = "story" + story.idStory
        htmlclone.querySelector("h3").innerText = story.title;
        htmlclone.querySelector("h6").innerText = new Date(story.date).toLocaleDateString()
        htmlclone.querySelector("p").innerText = story.text;

        if (story.image !== "" && story.image !== null) {
            htmlclone.querySelector("img").src = story.image;
        } else {
            htmlclone.querySelector("figure").remove();
            htmlclone.querySelector(".col-9").classList.toggle("col-sm-10");
            htmlclone.querySelector(".col-9").classList.toggle("col-9");
        }

        const div3 = await this.#buildStoryTags(story)

        htmlclone.querySelector("article").append(div3);

        return htmlclone;
    }

    /**
     * @private function BuildStorietag is used for building the HTML story tags that are attached to the story
     * @param story is the story where you want the tag for
     * @returns {Promise<HTMLDivElement|boolean>} a div element with the tags
     *
     * @author Marco de Boer
     */
    async #buildStoryTags(story) {
        const div = await this.#tagManager.buildTagList(story);
        if (!div){
            return document.createElement('div');
        }else{
            div.classList.add("d-flex", "justify-content-end", "gap-2", "my-1")
            return div;
        }
    }
}