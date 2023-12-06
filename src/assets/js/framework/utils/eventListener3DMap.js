import * as THREE from 'three';

/**
 * A class for putting an eventListener on a 3d object in a 3d map.
 * @author Saleeman
 */
export class EventListener3DMap {
    #raycaster
    #camera
    #mouse
    #renderer
    #scene

    constructor(raycaster,camera, mouse, scene,renderer) {
        this.#raycaster = raycaster;
        this.#camera = camera;
        this.#mouse = mouse;
        this.#scene = scene;
        this.#renderer = renderer;
        raycaster.setFromCamera(this.#mouse, this.#camera);
        window.addEventListener( 'pointermove', () => this.#keepTrackOfMouseCoordinates());
    }

    /**
     Updates the raycaster with the current camera and mouse coordinates
     @author saleeman
     */
    updateRaycaster(){
        const raycaster = this.#raycaster;
        raycaster.setFromCamera(this.#mouse, this.#camera);
    }

    /**
     Keeps track of the mouse coordinates using the pointermove event
     @author saleeman
     */
    #keepTrackOfMouseCoordinates(){
        let mouse = this.#mouse;
        let rect = this.#renderer.domElement.getBoundingClientRect();
        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components
        mouse.x = ( ( event.clientX - rect.left ) / ( rect.right - rect.left ) ) * 2 - 1;
        mouse.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
    }

    /**
     Initializes a listener for the passed on object.
     @param {string} type - The type of listener to initialize ("click" or "hover")
     @param {string} targetedObject - The type of object to target for selection
     @param {function} listener - The listener function to execute when an object is selected
     @author saleeman
     */
    initializeListener(type, targetedObject, listener){
        switch (type){


            case "click":
                window.addEventListener("click", ()=> {
                    let clickedObject = this.#handleClick(targetedObject);
                    // check if the returned object isnt undefined if true continue
                    if (clickedObject !== undefined){
                        listener(clickedObject)
                    }
                })
                break;
            case "hover":
                window.addEventListener("mousemove", ()=> {
                    let hoveredObj = this.#handleHover(targetedObject);
                    // check if the returned object isnt undefined if true continue
                    if (hoveredObj !== undefined){
                        listener(hoveredObj)
                    }
                })
                break;
            case "touchstart":
                window.addEventListener("touchstart", (event) => {
                    // Prevent the default touch behavior
                    //event.preventDefault();

                    // Retrieve the touch target element
                    let touchTarget = event.target;

                    // Perform necessary logic for touch events
                    // You can customize this part based on your requirements
                    let touchedObject = this.#handleTouch(targetedObject, touchTarget);
                    if (touchedObject !== undefined) {
                        listener(touchedObject);
                    }
                });
                break;
        }
    }
    /**
     Handles object selection for a click event
     @param {string} targetedObject - The type of object to target for selection
     @return {Runtime.RemoteObject | RemoteObject} - The clicked object
     @author saleeman
     */
    #handleClick(targetedObject){
        // objects the raycaster is intersecting with
        let intersects = this.#raycaster.intersectObjects(this.#scene.children);

        // if hover raycaster is hitting more than 0 items continue. if not then theres nothing to click on.
        if (intersects.length > 0){
            let clickedObject = intersects[0].object;
            if (targetedObject.trim() !== ""){
                if (clickedObject.type === targetedObject){
                    return clickedObject;
                }
            }
        }
    }

    #handleTouch(targetedObject, touchTarget) {
        // Perform necessary logic based on the touchTarget element and targetedObject type
        // Customize this part according to your requirements

        // Example: Check if the touchTarget matches the targetedObject type
        if (targetedObject.trim() !== "" && touchTarget.type === targetedObject) {
            return touchTarget;
        }

        // Return undefined if the touchTarget doesn't match the targetedObject type
        return undefined;
    }

    /**
     * Handle object hovering.
     * @param {string} targetedObject - The type of object to target.
     * @returns {Runtime.RemoteObject | RemoteObject} The hovered object.
     * @author saleeman
     */
    #handleHover(targetedObject){
        const raycaster = this.#raycaster;
        const camera = this.#camera;
        const mouse = this.#mouse;
        const scene = this.#scene;

        raycaster.setFromCamera(mouse, camera);
        //objects the raycaster is intersecting with
        const intersects = raycaster.intersectObjects(scene.children);

        for (let i = 0; i < intersects.length; i++) {
            let hoveredObject = intersects[i].object
            // add code for the hovered object
            if (targetedObject.trim() !== ""){
                if (hoveredObject.type === targetedObject){
                    return hoveredObject;
                }
            }
        }
    }
}