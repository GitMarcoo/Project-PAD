/**
 * This class is responsible for creating the textSprite. It will get the amount of stories at the location and display it in a circle
 * @author Marco de Boer
 */

import {allStoriesRepository} from "../../repositories/allStoriesRepository.js";
import * as THREE from 'three';



export class SpriteHelper {

    #allStoriesRepository;
    #radius;

    constructor() {
        this.#allStoriesRepository = new allStoriesRepository();
        this.#radius = 50;
    }


    /**
     * This method is responsible for creating the textSprite. It will get the amount of stories at the location and display it in a circle
     * the location is also used to get the right stories from the DB in another function.
     * @param location the location u want to display
     * @param opts the options for the text
     * @returns {Promise<THREE.Sprite>} textSprite
     *
     * @author Marco de Boer
     */

    async makeTextSprite(location, opts) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        let countofstories = await this.#allStoriesRepository.getCountOfStories(location);
        countofstories = countofstories[0].count;

        // Set the canvas dimensions based on the circle radius
        canvas.width = this.#radius * 2;
        canvas.height = this.#radius * 2;

        // Draw the background circle
        context.beginPath();
        context.arc(this.#radius, this.#radius, this.#radius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Adjust the background color and opacity as needed
        context.fill();

        // Draw the text onto the canvas
        let text = countofstories;
        const fontSize = 40; // Adjust as needed
        const fontFamily = 'Arial'; // Adjust as needed
        context.font = `${fontSize}px ${fontFamily}`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'white'; // Adjust the text color as needed
        context.fillText(text, this.#radius, this.#radius);

        // Create a texture from the canvas
        const textTexture = new THREE.CanvasTexture(canvas);

        // Create the sprite material with the text texture
        const spriteMaterial = new THREE.SpriteMaterial({ map: textTexture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.hasBeenHovered = false;
        sprite.name = location;
        sprite.countofstories = countofstories;
        let spriteMinScale = 2;
        let spriteScaleFactor = countofstories / 100 + 1;
        let spriteMaxScale = 8;
        let spriteScale = spriteMinScale;
        if (spriteScaleFactor * spriteMinScale > spriteMaxScale) {
            spriteScale = spriteMaxScale;
        } else {
            spriteScale = spriteScaleFactor * spriteMinScale;
        }
        sprite.scale.set(spriteScale, spriteScale, 0.1);
        sprite.center.set(0.5, 0.5);
        sprite.renderOrder = 1;

        return sprite;
    }

}