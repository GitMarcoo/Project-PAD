/** This controller The user's story is put in the database
 * and the image of the story is put in the upload file
 *
 * @author Beyza Kurt
 */
import {Controller} from "./controller.js";
import {addStoriesRepository} from "../repositories/addStoriesRepository.js";
import {NetworkManager} from "../framework/utils/networkManager.js";
import {AlertController} from "./alertController.js";
import {App} from "../app.js";

export class addStoriesController extends Controller {
    #addStoriesRepository
    #addStoriesView
    #networkManager
    textarea;
    title;
    charCountDiv;
    characterCount;
    caption;
    sampleFileInput;
    #titleInputLimit;
    #storyInputLimit;
    #locations;
    #currentdate;


    constructor() {
        super();
        this.#addStoriesRepository = new addStoriesRepository();
        this.#titleInputLimit = 60;
        this.#storyInputLimit = 8000;
        this.#currentdate = new Date();
        this.#currentdate.setMinutes(this.#currentdate.getMinutes() - this.#currentdate.getTimezoneOffset());

        this.#networkManager = new NetworkManager();
        this.#setupView();
    }

    /**
     * Loads content of addStories html into the index.html .content div
     * @returns {Promise<>}
     * @private
     */
    async #setupView() {
        this.#addStoriesView = await super.loadHtmlIntoContent("html_views/addStories.html")

        this.#addStoriesView.querySelector("#date").valueAsDate = this.#currentdate;
        try {
            this.#locations = await this.#addStoriesRepository.getLocations();
            for (let location of this.#locations) {
                let option = document.createElement("option");
                option.value = location.name;
                option.text = location.name;
                this.#addStoriesView.querySelector("#location").appendChild(option);
            }
        } catch (e) {
            if (e.code === 400){
                AlertController.show("De locaties kunnen niet worden opgehaald van de server!", "danger")
            }
        }

        this.#checkForQueryParamAndHandler();


        this.#addStoriesView.querySelector("#submit").addEventListener("click",
            (event) => {
                this.#postStories(event);
            });

        this.#addStoriesView.querySelector("#story").addEventListener("input", (event) => {
            this.limitTextarea(event);
        });

        this.#addStoriesView.querySelector("#story").addEventListener("paste", (event) => {
            setTimeout(() => {
                this.limitTextarea(event);
            }, 0);
        });


        this.#addStoriesView.querySelector("#title").addEventListener("input", (event) => {
            this.limitTextarea2(event);
        });

        this.#addStoriesView.querySelector("#title").addEventListener("paste", (event) => {
            setTimeout(() => {
                this.limitTextarea2(event);
            }, 0);
        });


        this.#addStoriesView.querySelector("#story").addEventListener("input",
            (event) => {
                this.count(event);
            });


        this.#addStoriesView.querySelector("#sampleFile").addEventListener("change",
            (event) => {
                this.sampleFile(event);
            });

        this.#addStoriesView.querySelector("#story").addEventListener("input",
            (event) => {
                this.autoResizeTextarea(event.target);
            });


    }

    /**
     Check for a "location" query parameter in the current URL and update the corresponding select input value in the
     addStories view. Also, reset the URL's hash to "#addStories" to keep it clean.
     */
    #checkForQueryParamAndHandler(){
        const params = new URLSearchParams(window.location.search);
        const location = params.get("location");
        const selectLocation = this.#addStoriesView.querySelector("#location")
        if (location !== null){
            selectLocation.value = location;
        }
        const newUrl = window.location.pathname + '#addStories';
        history.replaceState(null, null, newUrl);
    }


    /**
     * this function limits the text in textarea to 8000 chars when the user types or pastes text
     * @param event
     */
    limitTextarea(event) {
        event.preventDefault();

        const textarea = this.#addStoriesView.querySelector("#story");
        const text = textarea.value;

        if (text.length > 8000) {
            textarea.value = text.slice(0, 8000);
        }

        textarea.addEventListener('paste', (e) => {
            const pastedText = e.clipboardData.getData('text/plain');
            const newText = textarea.value + pastedText;

            if (newText.length > 8000) {
                e.preventDefault();
                textarea.value = newText.slice(0, 8000);
            }
        });
    }


    /**
     * this function limits the title length to 60 characters
     * @param event
     */
    limitTextarea2(event) {
        event.preventDefault();


        const titleInput = this.#addStoriesView.querySelector("#title");
        if (titleInput.value.length > 60) {
            titleInput.value = titleInput.value.slice(0, 60);
        }
    }


    /**
     * this function counts the characters while the user is typing
     * @param event
     */
    count(event) {
        event.preventDefault();

        this.charCountDiv = this.#addStoriesView.querySelector("#char-count");
        this.characterCount = this.#addStoriesView.querySelector("#story").value.length;
        this.charCountDiv.innerText = `${(this.characterCount)}/8000 characters`;
    }

    /**
     * this function shows the filename of the file in caption the user uploaded
     * @param event
     */
    sampleFile(event) {
        event.preventDefault();
        let src = URL.createObjectURL(event.target.files[0])
        console.log(src)
        this.sampleFileInput = this.#addStoriesView.querySelector("#sampleFile");
        this.#addStoriesView.querySelector('#imgPreview').src = src;
        // this.caption = this.#addStoriesView.querySelector("#caption");

        if (this.sampleFileInput.value) {
            const fileName = this.sampleFileInput.value.split('\\').pop();
            // this.caption.innerText = fileName;
        } else {
            // this.caption.innerText = 'Afbeelding toevoegen';
        }
    }

    /**
     * this function makes textarea automatically bigger as the user types
     * @param textarea
     */
    autoResizeTextarea(textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
        window.scrollTo(0, document.body.scrollHeight);

    }


    /**
     * async function to put story into database
     * by getting user input of title, text, location and image
     * user gets error if input is incorrect
     * @param event
     * @returns {Promise<void>}
     */


    async #postStories(event) {
        event.preventDefault();

        let title = this.#addStoriesView.querySelector("#title").value;
        let text = this.#addStoriesView.querySelector("#story").value;
        const locationSelect = this.#addStoriesView.querySelector("#location");
        const location = locationSelect.options[locationSelect.selectedIndex].text;
        const errorBox = this.#addStoriesView.querySelector(".error");
        const titleError = this.#addStoriesView.querySelector("#titleError");
        const locationError = this.#addStoriesView.querySelector("#locationError");
        const storyError = this.#addStoriesView.querySelector("#storyError")
        const textError = this.#addStoriesView.querySelector("#textError");
        const date = new Date(this.#addStoriesView.querySelector("#date").value);
        const dateError = this.#addStoriesView.querySelector("#dateError");
        if (titleError.classList.contains("d-none") === false) {
            titleError.classList.toggle("d-none");
        }

        if (locationError.classList.contains("d-none") === false) {
            locationError.classList.toggle("d-none");
        }

        if (storyError.classList.contains("d-none") === false) {
            storyError.classList.toggle("d-none");
        }

        if (dateError.classList.contains("d-none") === false) {
            dateError.classList.toggle("d-none");
        }

        if (title.length === 0 || title.length > 60 || text.length === 0 || text.length < 10 || text.length > 8000) {
            if (title.length === 0) {
                // errorBox.innerHTML = "Titel mag niet leeg zijn!";
                titleError.classList.toggle("d-none");
                titleError.innerHTML = "Titel mag niet leeg zijn!";

            } else if (title.length > 60) {
                titleError.classList.toggle("d-none");
                titleError.innerHTML = "Titel mag niet meer dan 60 karakters hebben!";
            }

            if (text.length === 0 || text.length < 10 || text.length > 8000) {
                storyError.classList.toggle("d-none");
                storyError.innerHTML = "Schrijf een verhaal van min. 100 en max. 8000 karakters!";

            }

            if (locationSelect.value === "") {
                locationError.classList.toggle("d-none");
                locationError.innerHTML = "Selecteer een locatie!";
            }

            if (date === "" || date > this.#currentdate || date < new Date(1950, 0, 1)){
                dateError.classList.toggle("d-none");
                dateError.innerHTML = "Selecteer geldige datum!";
            }


        } else {

            try {
                const userId = App.sessionManager.get("userId");
                const fileInput2 = this.#addStoriesView.querySelector("#sampleFile");
                const file2 = fileInput2.files[0];
                let mysqlDateString = date.toISOString().slice(0, 19).replace('T', ' ');
                if (file2 !== undefined) {

                    let formData = new FormData()
                    formData.append("sampleFile", file2)

                    let name;
                    //do File upload request
                    try {
                        const response = await this.#networkManager.doFileRequest("/upload", "POST", formData);

                        //assign the file's unique name to a variable
                        name = response;
                        //here we know file upload to upload folder is successful, otherwise would've triggered catch
                        fileInput2.value = "";


                    } catch (e) {
                        console.error(e);
                    }

                    //put file name with the address in variable
                    let file = "/uploads/" + name + ".jpg";
                    try {
                        let response = await this.#addStoriesRepository.createStory(title, text, location, file, userId, mysqlDateString);
                        await AlertController.show("Verhaal geplaatst!", "success");

                        window.location = `#allStories`

                    } catch (e) {
                        if (e.code === 400){
                            AlertController.show("Problemen met de server, probeer het later opnieuw!", "danger");
                        }
                    }
                }else {
                    try {
                        let response = await this.#addStoriesRepository.createStory(title, text, location, null, userId, mysqlDateString);
                        await AlertController.show("Verhaal geplaatst!", "success");

                        window.location = `#allStories`

                    } catch (e) {
                        if (e.code === 400){
                            AlertController.show("Problemen met de server, probeer het later opnieuw!", "danger");
                        }
                    }
                }

                //put everything in createStory method

            } catch (e) {
                console.error(e);
                if (e.code === 400){
                    AlertController.show("Problemen met de server, probeer het later opnieuw!", "danger");
                }
            }

        }
    }



}







