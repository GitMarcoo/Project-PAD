import {Controller} from "./controller.js";
import {UsersRepository} from "../repositories/usersRepository.js";

/**
 *
 * @author Salma Achahbar
 */
export class RegisterController extends Controller{
    #registerView
    #usersRepository

    constructor() {
        super();

        this.#usersRepository = new UsersRepository();
        this.#setupView();

    }

    async #setupView(){
        this.#registerView = await super.loadHtmlIntoContent("html_views/register.html");
        this.#registerView.querySelector("#registerBtn").addEventListener("click", ()=> this.#saveUser())
        this.#registerView.querySelector("#loginBtn").addEventListener("click", function () {
            document.location.href = '#login';
        })
    }

    async #saveUser(){
        const username = this.#registerView.querySelector("#userName").value;
        const email = this.#registerView.querySelector("#email").value;
        const password = this.#registerView.querySelector("#password").value;
        const error = this.#registerView.querySelector(".error");

        if(username.length === 0 || email.length === 0 || password.length === 0 ){
            if(username.length === 0 ){
                error.innerHTML = "Gebruikersnaam is verplicht";
            }else if(email.length === 0 ){
                error.innerHTML = "email is verplicht";
            }else if(password.length === 0 ){
                error.innerHTML = "Wachtwoord is verplicht";
            }
        }else{
            error.innerHTML = "";

            try {

                await this.#usersRepository.register(username, password, email);

                alert("Geregistreerd! U kunt nu inloggen");
                window.location = '#login';
            } catch (error) {
                if(error.code === 400){
                    this.#registerView.querySelector(".error").innerHTML = "Gebruikersnaam is al in gebruik";
                }
                console.error("user not registered: ", error);
            }
        }
    }
}