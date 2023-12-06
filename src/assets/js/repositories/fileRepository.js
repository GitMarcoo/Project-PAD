// /**
//  * Repository for addStories
//  * @author Beyza Kurt
//  */
//
// import {NetworkManager} from "../framework/utils/networkManager.js";
//
// export class fileRepository {
//     #route
//     #networkManager
//
//     constructor() {
//         this.#route = "/upload"
//         //The network manager used for making requests to the server.
//         this.#networkManager = new NetworkManager();
//     }
//
//     /**
//      * Create a new story in the database
//      * @returns {Promise<void>} - A Promise that resolves when the story is successfully added to the database.
//      */
//     putImage(image){
//         this.#networkManager.doRequest(this.#route, "POST", {image: image})
//     }
//
// }