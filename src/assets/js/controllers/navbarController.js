/**
 * Responsible for handling the actions happening on the navigation
 *
 * @author Saleeman
 */

import { App } from "../app.js";
import {Controller} from "./controller.js";

export class NavbarController extends Controller{
    #navbarView
    #burgerMenuIsToggled
    #userDropdownIsToggled

    constructor() {
        super();
        this.#setupView();
        this.#burgerMenuIsToggled = false;
        this.#userDropdownIsToggled = false;
    }

    /**
     * Loads contents of desired HTML file into the index.html .navigation div
     * @returns {Promise<void>}
     * @private
     */
    async #setupView() {
        //await for when HTML is
        this.#navbarView = await super.loadHtmlIntoNavigation("html_views/navbar.html")
        this.#authenticateUser();

        //from here we can safely get elements from the view via the right getter
        const anchors = this.#navbarView.querySelectorAll("a.ov-nav-link");
        const burgerMenuIcon = this.#navbarView.querySelector(".burger-menu i");
        const userNavIcon = this.#navbarView.querySelector(".fa-user");

        const loginLink = this.#navbarView.querySelector(".items-drop .ov-nav-link")

        //set click listener on each anchor
        anchors.forEach(anchor => anchor.addEventListener("click", (event) => this.#handleClickNavigationItem(event, anchors)))

        burgerMenuIcon.addEventListener("click", () => this.#handleMenuToggle());

        userNavIcon.addEventListener('click', ()=> this.#handleUserToggle());

        loginLink.addEventListener("click", () => this.#authenticateUser());

        this.#setCorrectActiveLink(anchors);
    }

    #setCorrectActiveLink(anchors){

        const activePage = location.href.toString().split("#")[1];
        const activeAnchor = this.#navbarView.querySelector(`a[data-controller='${activePage}']`);
        if (activeAnchor !== null){
            anchors.forEach(anchor =>{
                if (anchor.datacontroller !== activePage){
                    anchor.classList.remove("active")
                }
            })
            activeAnchor.classList.add("active");
        } else {
            anchors.forEach(anchor =>{
                    anchor.classList.remove("active")
            })
        }
    }

    /**
     * @author Saleeman
     * This method handles the dropdown if you click on the user
     */
    #handleUserToggle(){
        const userDropdown = this.#navbarView.querySelector(".nav-user-dropdown")

        if (this.#userDropdownIsToggled){
            userDropdown.style.display = 'none';
            this.#userDropdownIsToggled = false;
        }else{
            userDropdown.style.display ='block'
            this.#userDropdownIsToggled = true;
        }
    }

    /**
     * method to handle menu toggle
     * @author Saleeman
     */
    #handleMenuToggle(){
        const navItems = this.#navbarView.querySelector(".nav-items");

        if (this.#burgerMenuIsToggled){
            navItems.style.left = "-100vw";
            this.#burgerMenuIsToggled = false;
        }else{
            navItems.style.left = "0";
            this.#burgerMenuIsToggled = true;
        }
    }

    /**
     * a method to authenticate the user and show them content based on if theyre logged in or not
     * @author Saleeman
     */
    #authenticateUser(){
        const loginLink = this.#navbarView.querySelector(".items-drop .ov-nav-link")
        // const profileLink = this.#navbarView.querySelector(".profile-link");
        const username = this.#navbarView.querySelector("#navUsername");
        const loggedInUser = App.sessionManager.get("userId");
        const loggedInUsername = App.sessionManager.get("username");

        // const notifications = this.#navbarView.querySelector(".fa-envelope");


        if (loggedInUser != null){
            username.innerHTML = `Welkom,  ${loggedInUsername}`;
            loginLink.dataset.controller = "logout"
            loginLink.href = "#";
            loginLink.textContent = "Uitloggen";
        }else{
            username.innerHTML = "Log in";
            // profileLink.style.display = "none";
            // notifications.style.display = "none"

            loginLink.dataset.controller = "login"
            loginLink.href = "#";
            loginLink.textContent = "Inloggen"
        }
    }

    /**
     * Reads data attribute on each .nav-link and then when clicked navigates to specific controller
     * @param event - clicked anchor event
     * @param anchors - all the selected anchors. to work with them in this function
     * @returns {boolean} - to prevent reloading
     * @private
     */
    #handleClickNavigationItem(event, anchors) {
        event.preventDefault();

        //Get the data-controller from the clicked element (this)
        const clickedAnchor = event.target;
        const controller = clickedAnchor.dataset.controller;
        const activePage = location.href;

        if(typeof controller === "undefined") {
            console.error("No data-controller attribute defined in anchor HTML tag, don't know which controller to load!")
            return false;
        }
        //TODO: You should add highlighting of correct anchor when page is active :)
        anchors.forEach(anchor =>{
            if (!activePage.includes(controller)){
                anchor.classList.remove("active")
            }
        })
        clickedAnchor.classList.add("active");

        //Pass the action to a new function for further processing
        App.loadController(controller);

        //Return false to prevent reloading the page
        return false;
    }

}
