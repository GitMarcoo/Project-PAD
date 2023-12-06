/**
 * Entry point front end application - there is also an app.js for the backend (server folder)!
 *
 * All methods are static in this class because we only want one instance of this class
 * Available via a static reference(no object): `App.sessionManager.<..>` or `App.networkManager.<..>` or `App.loadController(..)`
 *
 * @author Lennard Fonteijn & Pim Meijer
 */

import { SessionManager } from "./framework/utils/sessionManager.js"
import { LoginController } from "./controllers/loginController.js"
import { NavbarController }  from "./controllers/navbarController.js"
import { UploadController }  from "./controllers/uploadController.js"
import { AllStoriesController }  from "./controllers/allStoriesController.js"
import { addStoriesController }  from "./controllers/addStoriesController.js"
import { fullStoriesController }  from "./controllers/fullStoriesController.js"
import {MapController} from "./controllers/mapController.js";
import {forumController} from "./controllers/ForumController.js";
import {CreateForumMessageController} from "./controllers/createForumMessageController.js";
import {forumMessageController} from "./controllers/forumMessageController.js";
import {RegisterController} from "./controllers/registerController.js";
import {AlertController} from "./controllers/alertController.js";

export class App {
    //we only need one instance of the sessionManager, thus static use here
    // all classes should use this instance of sessionManager
    static sessionManager = new SessionManager();
    //controller identifiers, add new controllers here
    static CONTROLLER_NAVBAR = "navbar";
    static CONTROLLER_LOGIN = "login";
    static CONTROLLER_LOGOUT = "logout";
    static CONTROLLER_WELCOME = "welcome";
    static CONTROLLER_UPLOAD = "upload";
    static CONTROLLER_ALLSTORIES = "allStories";
    static CONTROLLER_ADDSTORIES = "addStories";
    static CONTROLLER_FULLSTORIES = "fullStories";
    static CONTROLLER_MAP = "map";
    static CONTROLLER_FORUM = "forum";
    static CONTROLLER_FORUMPOST = "forumPost";
    static CONTROLLER_CREATEFORUMMESSAGE = "createMessage";
    static CONTROLLER_REGISTER = "register";
    static CONTROLLER_ALERT = "alert";

    constructor() {
        //Always load the navigation
        App.loadController(App.CONTROLLER_NAVBAR);
        App.loadController(App.CONTROLLER_ALERT);

        //Attempt to load the controller from the URL, if it fails, fall back to the welcome controller.
        // App.loadControllerFromUrl(App.CONTROLLER_WELCOME);
        App.loadControllerFromUrl(App.CONTROLLER_MAP);
    }

    /**
     * Loads a controller
     * @param name - name of controller - see static attributes for all the controller names
     * @param controllerData - data to pass from on controller to another - default empty object
     * @returns {boolean} - successful controller change
     */
    static loadController(name, controllerData) {

        //log the data if data is being passed via controllers
        if (controllerData && Object.entries(controllerData).length !== 0) {
        }

        //Check for a special controller that shouldn't modify the URL
        switch(name) {
            case App.CONTROLLER_NAVBAR:
                new NavbarController();
                return true;

            case App.CONTROLLER_LOGOUT:
                App.handleLogout();
                return true;
            case App.CONTROLLER_ALERT:
                new AlertController();
                return true;
        }

        //Otherwise, load any of the other controllers
        App.setCurrentController(name, controllerData);
        
        switch (name) {
            case App.CONTROLLER_LOGIN:
                App.isLoggedIn(() => new MapController(), () => new LoginController());
                break;
            case App.CONTROLLER_UPLOAD:
                App.isLoggedIn(() => new UploadController(), () => new LoginController());
                break;
            case App.CONTROLLER_ALLSTORIES:
                App.isLoggedIn(() => new AllStoriesController(), () => new AllStoriesController())
                break;
            case App.CONTROLLER_ADDSTORIES:
                App.isLoggedIn(() => new addStoriesController(), () => new LoginController());
                break;
            case App.CONTROLLER_FULLSTORIES:
                App.isLoggedIn(() => new fullStoriesController(), () => new fullStoriesController());
                break;
            case App.CONTROLLER_MAP:
                App.isLoggedIn(() => new MapController(), () => new MapController());
                break;
            case App.CONTROLLER_FORUM:
                App.isLoggedIn(() => new forumController, () => new forumController)
                break;
            case App.CONTROLLER_FORUMPOST:
                App.isLoggedIn(() => new forumMessageController(), () => new forumMessageController)
                break;
            case App.CONTROLLER_CREATEFORUMMESSAGE:
                App.isLoggedIn(() => new CreateForumMessageController(), () => new LoginController())
                break;
            case App.CONTROLLER_REGISTER:
                App.isLoggedIn(() => new RegisterController(), () => new RegisterController())
                break;
            default:
                return false;
        }

        return true;
    }

    /**
     * Alternative way of loading controller by url
     * @param fallbackController
     */
    static loadControllerFromUrl(fallbackController) {
        const currentController = App.getCurrentController();

        if (currentController) {
            if (!App.loadController(currentController.name, currentController.data)) {
                App.loadController(fallbackController);
            }
        } else {
            App.loadController(fallbackController);
        }
    }

    /**
     * Looks at current URL in the browser to get current controller name
     * @returns {string}
     */
    static getCurrentController() {
        const fullPath = location.hash.slice(1);

        if(!fullPath) {
            return undefined;
        }

        const queryStringIndex = fullPath.indexOf("?");
        
        let path;
        let queryString;

        if(queryStringIndex >= 0) {
            path = fullPath.substring(0, queryStringIndex);
            queryString = Object.fromEntries(new URLSearchParams(fullPath.substring(queryStringIndex + 1)));
        }
        else {
            path = fullPath;
            queryString = undefined
        }

        return {
            name: path,
            data: queryString
        };
    }

    /**
     * Sets current controller name in URL of the browser
     * @param name
     */
    static setCurrentController(name, controllerData) {
        if(App.dontSetCurrentController) {
            return;
        }

        if(controllerData) {
            history.pushState(undefined, undefined, `#${name}?${new URLSearchParams(controllerData)}`);    
        }
        else
        {
            history.pushState(undefined, undefined, `#${name}`);
        }
    }

    /**
     * Convenience functions to handle logged-in states
     * @param whenYes - function to execute when user is logged in
     * @param whenNo - function to execute when user is logged in
     */
    static isLoggedIn(whenYes, whenNo) {
        if (App.sessionManager.get("userId")) {
            whenYes();
        } else {
            whenNo();
        }
    }

    /**
     * Removes username via sessionManager and loads the login screen
     */
    static handleLogout() {
        App.sessionManager.remove("userId");

        //go to login screen
        App.loadController(App.CONTROLLER_LOGIN);
    }
}

window.addEventListener("hashchange", function() {
    App.dontSetCurrentController = true;
    App.loadControllerFromUrl(App.CONTROLLER_WELCOME);
    App.dontSetCurrentController = false;
});

//When the DOM is ready, kick off our application.
window.addEventListener("DOMContentLoaded", _ => {
    new App();
});