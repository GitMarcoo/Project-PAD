import {Controller} from "./controller.js";

/**
 * Class for showing alerts on the website
 * how you would use it in another class: AlertController.show("message", "type");
 * type can be: "success", "danger", "warning", "info"
 * if no type is specified, the default type will be "info"
 *
 * @author Saleeman
 */
export class AlertController extends Controller {

    static #alertView;
    static #validAlertTypes = ["success", "danger", "warning", "info"];
    static #defaultAType = "info";
    static #alertIsVisible = false;

    constructor() {
        super();
        this.setupView();
    }

    async setupView() {
        AlertController.#alertView = await super.loadHtmlIntoAlert("html_views/_alert.html");
    }

    /**

     Displays an alert message with a specified type.
     @param {string} message - The message to be displayed in the alert.
     @param {string} alertType - The type of alert to be displayed; "success", "danger", "warning", "info".
     @returns {void}
     @author Saleeman
     */
    static show(message, alertType) {
        const alert = AlertController.#alertView.querySelector(".alert-forum");
        const wrongInput = AlertController.#alertView.querySelector(".wrong-input");
        const closeButton = AlertController.#alertView.querySelector(".close-alert");

        if (!this.#alertIsVisible) {
            // delete the already existing alerts if there are any
            for (const type of AlertController.#validAlertTypes) {
                if (alert.classList.contains(`alert-${type}`)) {
                    alert.classList.remove(`alert-${type}`);
                }
            }
            alertType = this.#handleAlertType(alertType)

            // add style to the alert based on the type
            alert.classList.add(`alert-${alertType}`);

            wrongInput.innerText = message;
            alert.classList.remove("closed-alert");
            alert.classList.add("opened-alert");
            this.#alertIsVisible = true;

            AlertController.#closeListener();
            setTimeout(function () {
                closeButton.click();
            }, 5000);
        }
    }

    /**

     Adds a click event listener to the close button of the alert.
     When the button is clicked, the alert is closed and its visibility status is updated.
     @author Saleeman
     */
    static #closeListener() {
        const alert = AlertController.#alertView.querySelector(".alert-forum");
        const closeButton = AlertController.#alertView.querySelector(".close-alert");

        if (this.#alertIsVisible) {
            closeButton.addEventListener("click", () => {
                alert.classList.remove("opened-alert");
                alert.classList.add("closed-alert");
                this.#alertIsVisible = false;
            });
        }
    }

    /**
     * Handles the alertType. If it is a valid type it returns it otherwise it returns the default alertType
     * @param alertType
     * @returns {string|*}
     * @author Saleeman
     */
    static #handleAlertType(alertType) {
        if (!AlertController.#validAlertTypes.includes(alertType)) {
            return this.#defaultAType;
        } else {
            return alertType;
        }
    }
}
