/**
 * Controller for the createForumMessage view
 * @author Saleeman
 */
import {Controller} from "./controller.js";
import {forumRepository} from "../repositories/forumRepository.js";
import {App} from "../app.js";
import {AlertController} from "./alertController.js";
// import {Alert} from "../framework/utils/alertController";


export class CreateForumMessageController extends Controller {
    #forumRepository
    #createForumMessageView
    #alert
    constructor() {
        super();
        this.#forumRepository = new forumRepository();
        this.#setupView();
    }

    /**
     * setup the view, place a listener on the create message button and keep track of the number of characters being
     * typed
     * @returns {Promise<void>}
     * @author Saleeman
     */
    async #setupView() {
        this.#createForumMessageView = await super.loadHtmlIntoContent("html_views/createForumMessage.html");
        let createMessagebtn = this.#createForumMessageView.querySelector("#createMessagebtn");
        createMessagebtn.addEventListener("click", ()=> this.#createMessage())
        this.#keepTrackOfCharacterCount();

    }

    /**
     * This function is called when the user click on the create message button.
     * its validate user input and alerts the user messages based on that input. After confirming the user input is
     * correct it forum repository makes a post req with the given value
     * @author Saleeman
     */
    async #createMessage(){
        const user = App.sessionManager.get("userId");
        // const user = 1;
        const messageTitle = this.#createForumMessageView.querySelector("#messageTitle");
        const messageText = this.#createForumMessageView.querySelector("#messageText");

        if (messageText.value.trim() === "" || messageTitle.value.trim() === ""){
            AlertController.show("Sommige velden zijn niet ingevuld!", "danger")
            return;
        }
        let titleVdnResult = this.#validateCharacterCount(messageTitle.value);

        if (!titleVdnResult.succes){
            AlertController.show(`Titel is te groot! Mag max 100 karakters zijn en je hebt ${titleVdnResult.numberOfCharacters} karakters`, "danger")
            return;
        }
        try{
            await this.#forumRepository.postMessage(user, messageTitle.value, messageText.value);
            messageTitle.value = "";
            messageText.value = "";
            AlertController.show("Bericht is geplaatst", "success")
        }catch(e){
            if (e.code === 400){
                AlertController.show("Geen verbinding met de server", "danger")
            }
        }


  }

    /**
     * this function checks if the user didnt went over the max number of characters
     * @param str
     * @returns {{succes: boolean}|{numberOfCharacters: *, succes: boolean}} if the user is below the max it only
     * returns succes: true. But if it did went over the max it returns false and also the number of characters the user
     * typed in so that we can pass it on to the user
     * @author Saleeman
     */
    #validateCharacterCount(str){
        let maxCharacterCount = 100;
        const numberOfCharacters = str.length;
        if (numberOfCharacters > maxCharacterCount) {
            return {succes: false, numberOfCharacters: numberOfCharacters}
        } else {
            return {succes: true}
        }
    }

    /**
     * this function keeps track of the number of characters being typed in. This is possible because of the keyup
     * eventListener. It also checks if the user didnt go over the max number of chracters by passing the amount
     * of character onto another function that handles it.
     * @author Saleeman
     */
    #keepTrackOfCharacterCount(){
        const characters = this.#createForumMessageView.querySelector(".characters");
        const text = this.#createForumMessageView.querySelector("#messageText");

        text.addEventListener("keyup", ()=>{
            characters.innerText = `Aantal karakters: ${text.value.length}/1000`;
            this.#validateMessageNumberOfChr(text.value.length)
        })

    }

    /**
     * This function validates the number of characters. If the number of characters is over the max it
     * disables the createMessage button and makes it visible by adding a class to the classlist
     * @param numberOfChr the number of chracters. It uses this to check if it went over the max
     * @author Saleeman
     */
    #validateMessageNumberOfChr(numberOfChr){
        let createMessagebtn = this.#createForumMessageView.querySelector(".create-message-btn");
        const characters = this.#createForumMessageView.querySelector(".characters");
        if (numberOfChr > 1000){
            characters.style.color = "red";
            createMessagebtn.disabled = true;
            createMessagebtn.classList.add("not-clickable");
        }else{
            characters.style.color = "black";
            createMessagebtn.disabled = false
            createMessagebtn.classList.remove("not-clickable");
        }
    }


}