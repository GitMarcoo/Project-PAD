/**This class is responsible for loading the map
 * @author Marco de Boer & Saleeman
 */

import {Controller} from "./controller.js";
import {MapRepository} from "../repositories/mapRepository.js";
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {allStoriesRepository} from "../repositories/allStoriesRepository.js";
import {StoryHTMLBuilder} from "../framework/utils/storyHTMLBuilder.js";
import {EventListener3DMap} from "../framework/utils/eventListener3DMap.js";
import {SortData} from "../framework/utils/sortData.js";
import TWEEN from 'tween';
import {SpriteHelper} from "../framework/utils/spriteHelper.js";






export class MapController extends Controller {
    #mapRepository
    #allStoriesRepository
    #storyHTMLBuilder
    #mapView
    #canvasDiv
    #renderer;
    #camera;
    #controls;
    #scene;
    #loader;
    #light;
    #mouse;
    #raycaster;
    #mouseX
    #mouseY
    #eventListener
    #storiesData
    #locations
    #animationFrameId;
    #mapLoadPercentage = 0;
    #spriteHelper;
    #hoveredObject;
    #cameraOrigin
    #loadingManager;


    constructor() {
        super();
        this.#allStoriesRepository = new allStoriesRepository();
        this.#mapRepository = new MapRepository();
        this.#storyHTMLBuilder = new StoryHTMLBuilder();
        this.#mapRepository = new MapRepository();
        this.#loadingManager = new THREE.LoadingManager();
        this.#canvasDiv = document.querySelector('#threeHere');
        this.#mouseX = 0;
        this.#mouseY = 0;
        this.#mouse = new THREE.Vector2();
        this.#raycaster = new THREE.Raycaster();
        this.#spriteHelper = new SpriteHelper();
        this.#setupView();
    }

    /**
     * This method loads the view. It is called in the constructor of the class
     *
     * @returns {Promise<void>}
     */
    async #setupView() {
        this.#mapView = await super.loadHtmlIntoContent("html_views/map.html")
        await this.#setupScene();
        this.#eventListener = new EventListener3DMap(this.#raycaster, this.#camera,this.#mouse, this.#scene, this.#renderer)

        this.#animate();

        const createStoryButton = this.#mapView.querySelector(".create-story-for-location");

        window.addEventListener( 'mousemove', (e) => {
            this.#mouseY = e.clientY;
            this.#mouseX = e.clientX;
            this.#keepOverlayHidden();
            if (this.#locations.includes(this.#hoveredObject)){
                this.#spriteHelper.spriteAfterHoverColor(this.#hoveredObject)
            }
        });

        setInterval(this.#eventListener.updateRaycaster(), 50);
        this.#eventListener.initializeListener("click", "Sprite", (selectedPiece) => {
            this.#moveSpriteToCameraAnimation(selectedPiece.position.x, selectedPiece.position.y,selectedPiece.position.z)
            createStoryButton.addEventListener("click", ()=>{
                location.href = `?location=${selectedPiece.name}#addStories`
            })
            this.#showOverlayBasedOnLocation(selectedPiece.name);
        })

        this.#eventListener.initializeListener("touchstart", "Sprite", (selectedPiece) => {
            this.#moveSpriteToCameraAnimation(selectedPiece.position.x, selectedPiece.position.y,selectedPiece.position.z);

            // Add a touchstart event listener to the createStoryButton
            createStoryButton.addEventListener("touchstart", () => {
                location.href = `?location=${selectedPiece.name}#addStories`;
            });

            this.#showOverlayBasedOnLocation(selectedPiece.name);
        });

        this.#eventListener.initializeListener("hover", "Sprite", (selectedObject)=> this.#handleHover(selectedObject))
        this.#initializeListenersForFilters()

        window.addEventListener('resize', this.#onWindowResize);
    }

    /**
     * This method is responsible for setting up the scene
     * @author Marco de Boer
     */


    async #setupScene() {

        this.#scene = new THREE.Scene();
        this.#scene.background = new THREE.Color(0xffffff);

        this.#scene.add(await this.#createLight())

        this.#scene.add(await this.#createCamera())


        await this.#createRenderer()

        await this.#createControls()

        await this.#createLoader(this.#scene, this.#mapLoadPercentage)

        const loadingFinished = new Promise((resolve) => {
            const checkLoadingStatus = () => {
                if (this.#mapView.querySelector(".loadingText").innerHTML.toString().includes("100%")) {
                    this.#mapView.querySelector(".loadingScreen").classList.add("d-none");
                    resolve();
                } else {
                    setTimeout(checkLoadingStatus, 100); // Check again after 100 milliseconds
                }
            };
            checkLoadingStatus();
        });

        await loadingFinished;
        await this.#createLocationNamesInMap();


        this.#renderer.render(this.#scene, this.#camera)

        this.#cameraStartAnimation();
        this.#cameraOrigin = this.#camera;


    }


    /**
     * This functions animates the camera when the window is first opened.
     * It uses the tween library to animate the camera
     * @returns {Promise<void>}
     * @author Marco de Boer
     */
    async #cameraStartAnimation() {
        const coords = {x: this.#camera.position.x, y: this.#camera.position.y, z: this.#camera.position.z};
        let tween =  new TWEEN.Tween(coords).to({x: -35, y: 50, z: 70},2000)
            .onUpdate(() =>{
                this.#camera.position.set(coords.x, coords.y, coords.z)}
            )
        tween.delay(500)
        tween.start();
    }


    async #moveSpriteToCameraAnimation(spritex,spritey,spritez){

        const leftViewCenterCoords = {x: -14, y: 14, z: 4};
        const coords = {x: this.#scene.position.x, y: this.#scene.position.y, z: this.#scene.position.z};
        new TWEEN.Tween(coords).to({x: leftViewCenterCoords.x - spritex , y: 0, z: leftViewCenterCoords.z - spritez},1500)
            .onUpdate(() => {
                this.#scene.position.set(coords.x, coords.y, coords.z)
            }).start();

        const coordscam = {x: this.#camera.position.x, y: this.#camera.position.y, z: this.#camera.position.z};

        new TWEEN.Tween(coordscam).to({x: 30 , y: 60, z: 50},1500)
            .onUpdate(() => {
                this.#camera.position.set(coordscam.x, coordscam.y, coordscam.z)
            }).start();

    }

    async #moveSceneToCenter(){
        const coords = {x: this.#scene.position.x, y: this.#scene.position.y, z: this.#scene.position.z};
        new TWEEN.Tween(coords).to({x: 0 , y: -5, z: -6},2000)
            .onUpdate(() => {
                this.#scene.position.set(coords.x, coords.y, coords.z)
            }).start();

        const coordscam = {x: this.#camera.position.x, y: this.#camera.position.y, z: this.#camera.position.z};
         new TWEEN.Tween(coordscam).to({x: -35, y: 50, z: 70},2000)
            .onUpdate(() =>{
                this.#camera.position.set(coordscam.x, coordscam.y, coordscam.z)}
            ).start();


    }

    /**
     * This method is responsible for creating the tags in the map. It works by getting the tags from the database
     * and then creating a sprite for each tag. It then adds the sprite to the scene. It uses the spriteHelper class
     * to create the sprite.
     * @author Marco de Boer
     */

    async #createLocationNamesInMap(){
        const mapLocationsArray = await this.#mapRepository.get();
        this.#locations = mapLocationsArray.map(location => location.name)

        for (let maplocation of mapLocationsArray) {
            let locationSprite = await this.#spriteHelper.makeTextSprite(maplocation.name, null);
            locationSprite.position.set(maplocation.x, maplocation.y, maplocation.z);

            this.#scene.add(locationSprite);
        }
    }

    /**
     * This method is responsible for creating the light
     * @returns {Promise<*>} light
     *
     * @author Marco de Boer
     */

    async #createLight() {
        this.#light = new THREE.DirectionalLight(0xffffff, 1);
        this.#light.position.set(0, 20, 25)
        return this.#light;
    }

    /**
     * This method is responsible for creating the camera
     * @returns {Promise<*>} camera
     *
     * @author Marco de Boer
     */

    async #createCamera() {

        this.#camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.#camera.position.z = 50;
        this.#camera.position.y = 100;
        this.#camera.position.x = -25   ;

        this.#camera.zoom = 5;



        this.#camera.updateProjectionMatrix();


        return this.#camera;
    }

    /**
     * This method is responsible for creating the renderer
     * @returns {Promise<*>} renderer
     * @author Marco de Boer
     */


    async #createRenderer() {
        this.#renderer = new THREE.WebGLRenderer();
        this.#renderer.setSize(window.innerWidth, window.innerHeight);
        this.#renderer.setPixelRatio(window.devicePixelRatio);
        this.#renderer.outputEncoding = THREE.sRGBEncoding;
        this.#renderer.shadowMap.enabled = true;
        this.#renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.#mapView.querySelector('#threeHere').appendChild(this.#renderer.domElement);



        return this.#renderer;
    }

    /**
     * This method is responsible for creating the controls
     * @returns {Promise<*>} controls
     * @author Marco de Boer
     */


    async #createControls() {
        this.#controls = new MapControls(this.#camera, this.#renderer.domElement);
        this.#controls.target.set(0, 0, 0);
        this.#controls.enableZoom = true;
        this.#controls.enableRotate = true;
        this.#controls.enableDamping = true
        this.#controls.screenSpacePanning = true;
        this.#controls.panSpeed = 0.2;
        this.#controls.rotateSpeed = 0.4;
        this.#controls.maxPolarAngle = (Math.PI / 2)


        return this.#controls;
    }

    /**
     * This method is responsible for creating the loader
     * @returns {Promise<*>} loader
     * @param scene where the object should be loaded into
     * @author Marco de Boer
     */


     async #createLoader(scene) {
        this.#loader = new GLTFLoader(this.#loadingManager);
        const mapLoadbar = this.#mapView.querySelector(".loadingText");
        this.#loader.load('./assets/models/florijngroot3.glb', (gltf) => {

                gltf.scene.rotateY(1.1);
                gltf.scene.rotateZ(0.1);
                gltf.scene.position.y = 5;
                gltf.scene.position.z = -6;

                scene.add(gltf.scene);


            },
            // called while loading is progressing
            function (xhr) {
                let progress = xhr.loaded / 10620292;
                if (10620292 !== 0 && !isNaN(progress)) {
                    mapLoadbar.innerHTML = Math.round(progress * 100) + '% loaded';
                } else {
                    mapLoadbar.innerHTML = 'Loading...';
                }

            },
            // called when loading has errors
            function (error) {

                console.log('An error happened');

            });

        // this.#loader.co
    }

    /**
     * This method makes it possible to move the camera around
     *
     * @author Marco de Boer
     */

    #animate = () => {
        this.#animationFrameId = requestAnimationFrame(this.#animate)
        TWEEN.update()
        this.#controls.update()
        this.#renderer.render(this.#scene, this.#camera)
    }


    /**
     * This method is responsible for keeping the objects in the middle if the screen gets resized
     * @author Marco de Boer
     */


    #onWindowResize = () => {
        let aspect = window.innerWidth / window.innerHeight;
        this.#camera.left = -window.innerWidth / 2;
        this.#camera.right = window.innerWidth / 2;
        this.#camera.top = window.innerHeight / 2;
        this.#camera.bottom = -window.innerHeight / 2;
        this.#camera.updateProjectionMatrix();

        // this.#renderer.setSize(window.innerWidth , window.innerHeight );

    }

    /**
     * This method removes the event listeners
     *
     * @author Marco de Boer
     */

    dispose() {
        window.removeEventListener('resize', this.#onWindowResize);
    }


    /**
     * Hover handler
     * It gets the name of the hovered object and passes onto another function
     * it also keeps track of hovered items so that we dont spam the functions everytime the same object has been hovered
     * @author Saleeman
     */
    #handleHover(selectedObject) {
        let location;
        let hasbeenHovered;
        let hoveringLocation;
        hoveringLocation = true;
        hasbeenHovered = selectedObject.hasBeenHovered
        location = selectedObject.name;
        // check if the location has already been hovered. so that it doesnt spam GET reqs
        // I added an attribute to every object to keep track
        if (!hasbeenHovered) {
            selectedObject.hasBeenHovered = true;
            this.getCountOfStories(location)
        }
        this.#keepTrackOfHoveredLocations(location)
        this.#handleOverlayOnHover(hoveringLocation);
    }



    /**
     * Function to get the data from the repository and load it in the html view
     *@author Saleeman
     * @param location stories from specific location
     * @returns {Promise<void>}
     */
    async #showOverlayBasedOnLocation(location){
        const overlay = this.#mapView.querySelector(".map-overlay");
        const overlayBackground = await this.#mapView.querySelector(".overlay-background")
        const closeBtn = this.#mapView.querySelector(".btn-close");
        const  stories = this.#mapView.querySelector(".stories");
        this.#storiesData = null;
        try{
            //get all the stories based on the location
            this.#storiesData = await this.#allStoriesRepository.getStoryByLocation(location);
        }catch (e){
            console.log(e)
        }
        if (this.#storiesData === null || this.#storiesData === ""){
            stories.innerHTML = "Geen verhalen";
            stories.classList.add("no-stories")
        }else {
            if (stories.classList.contains("no-stories")){
                stories.classList.remove("no-stories")
            }
            // add the stories to the HTML view with an method
            await this.#handleFilter("new-old");
            // await this.#showStories(this.#storiesData);
        }
        overlay.style.right = "0";
        overlayBackground.style.display = "block"

        // event listener on the close button. if pressed set display to none
        closeBtn.addEventListener("click", ()=>{
            overlay.style.right = "-40vw"
            overlayBackground.style.display = "none"
            // this.#cameraStartAnimation()
             this.#moveSceneToCenter();
        })
    }

    /**
     Retrieves the count of stories for a given location from the repository and updates the UI to reflect the count.
     @param {string} location - The location to get the count of stories for.
     @returns {Promise<void>}
     @author Saleeman
     */
    async getCountOfStories(location){
        const count = await this.#allStoriesRepository.getCountOfStories(location);
        const numberOfStoriesSpan = this.#mapView.querySelector(".number-of-stories");
        numberOfStoriesSpan.textContent = count[0].count;
        this.#mapView.querySelector("#locationname").textContent = location + " heeft";
    }

    /**
     * function to load in the stories into the HTML view
     * @param stories what stories to load in
     * @returns {Promise<void>}
     * @author Saleeman
     */
    async #showStories(stories){
        try{
            const targetElement = this.#mapView.querySelector(".stories");
            targetElement.innerHTML = '';
            for(let story of stories){
                targetElement.append(await this.#storyHTMLBuilder.buildStoryUsingTemplate(story))
            }
        }catch (e){
            console.log(e)
        }
    }

    /**
     * method to keep track of which locations have been hovered
     * @param location the location we are hovering currently
     * @author Saleeman
     */
    #keepTrackOfHoveredLocations(location) {
        const scene = this.#scene;
        let object;

        for (let i = 0; i < this.#locations.length; i++) {
            object = scene.getObjectByName(this.#locations[i]);
            if (object.name !== location){
                object.hasBeenHovered = false;
            }
        }
    }



    /**
     * method to handle the position of the overlay/ div and when to show it
     * @param hoveringLocation if we are hovering a location at this moment
     * @author Saleeman
     */
    #handleOverlayOnHover(hoveringLocation) {
        const locationHoverOverlay = this.#mapView.querySelector(".location-hover");
        const behindLocationHover = this.#mapView.querySelector(".behind-location-hover");

        locationHoverOverlay.style.left = `${this.#mouseX +10}px`;
        locationHoverOverlay.style.top = `${this.#mouseY -30}px`;
        behindLocationHover.style.left = `${this.#mouseX -20}px`;
        behindLocationHover.style.top = `${this.#mouseY -20}px`;

        if (hoveringLocation){
            behindLocationHover.style.display = "block"
            locationHoverOverlay.style.display = "block"
        }
    }

    /**
     * initialize click listeners for the filter buttons. call function based on clicked button
     * @author Saleeman
     */
    #initializeListenersForFilters(){
        const oldNewBtn = this.#mapView.querySelector("#oldNew");
        const newOld = this.#mapView.querySelector("#newOld");

        oldNewBtn.addEventListener("click", () => this.#handleFilter("old-new"))
        newOld.addEventListener("click", ()=> this.#handleFilter("new-old"))
    }

    /**
     * filter based on the type. Do this by creating a sortData object and show the returned data
     * @param type type of sorting
     * @returns {Promise<void>}
     * @author Saleeman
     */
    async #handleFilter(type){
        let selector = type === "old-new" ? "oldNew" : "newOld";
        const filter = this.#mapView.querySelector(`#${selector}`)
        const nodes = this.#mapView.querySelector(".sorting-buttons").childNodes

        for(let i=0; i<nodes.length; i++) {
            if (nodes[i].nodeName.toLowerCase() === 'button') {
                if (nodes[i].classList.contains("sorting-active")){
                    nodes[i].classList.remove("sorting-active");
                }
            }
        }

        filter.classList.add("sorting-active");
        const newData = new SortData(type, this.#storiesData, "date");
        await this.#showStories(newData);
    }

    /**
     * This method hides the overlay while its not needed
     * @author Saleeman
     */
    #keepOverlayHidden() {
        const locationHoverOverlay = this.#mapView.querySelector(".location-hover");
        const divBehindLocationHoverOverlay = this.#mapView.querySelector(".behind-location-hover");
        locationHoverOverlay.style.display ="none"
        divBehindLocationHoverOverlay.style.display = "none"
    }
}