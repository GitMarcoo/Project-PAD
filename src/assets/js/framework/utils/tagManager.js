/**
 * Tag manager class handles the creation of tag and can check if a tag is existing
 *
 * @author Marco de Boer
 */

export class TagManager {
    #htmlFile

    constructor() {
        this.#htmlFile = "../../../../html_views/tag.html"
    }

    async buildTagListUsingHTML (story){
        if(this.#htmlFile === null || this.#htmlFile === undefined){
            this.#htmlFile = await fetch("../../../../html_views/tag.html")
        }
        const template = this.#htmlFile.querySelector("template");

    }

    /**
     * BuildTagList is a function where when you build a story you can call this function to
     * create the active tags. It works by checking if a tag is used and then creating the div
     * and adding the css classes to it.
     *
     * @param story where you are making the tags for
     * @returns {Promise<boolean|HTMLDivElement>} a div element with tag
     */
    async buildTagList (story){
            const div = document.createElement('div');
            try{
            switch (true) {
                case (story.location !== '' && story.location !== null):
                    const divPlaats = document.createElement('div');
                    divPlaats.classList.add("flex-item", "tag", "tagPlaats");
                    divPlaats.innerText = story.location;
                    div.append(divPlaats);
            }
            if (div.innerText === "undefined"){
                return false;
            }else{
            return div;}
            }catch (e){
                //there is no tag
            }
    }
}