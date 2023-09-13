import { generateBoids } from "./components/boids.js";
import * as THREE from "https://unpkg.com/three@0.156.1/build/three.module.js";
import { EffectComposer } from "https://unpkg.com/three@0.156.1/examples/jsm/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "https://unpkg.com/three@0.156.1/examples/jsm/postprocessing/UnrealBloomPass.js";
import { RenderPass } from "https://unpkg.com/three@0.156.1/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "https://unpkg.com/three@0.156.1/examples/jsm/postprocessing/OutputPass.js";
import { GLTFLoader } from "https://unpkg.com/three@0.156.1/examples/jsm/loaders/GLTFLoader";


class Scene {
    constructor() {
        this.name = "life_as_a_boid";
        this.z_index = 10;
        this.activated = false;
        this.hands_position = [];
        this.hands_handedness = [];
        this.boids = [];
    }
    set(width, height, socket) {
        this.canvasElement = document.createElement('canvas');
        this.canvasElement.width = width;
        this.canvasElement.height = height;
        this.canvasElement.style.position = 'absolute';
        this.canvasElement.style.left = '0px';
        this.canvasElement.style.top = '0px';
        this.canvasElement.style.zIndex = this.z_index;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvasElement,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.scene.add( new THREE.AmbientLight( 0xcccccc ) );


        // this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
        // let z = height / 2 / Math.tan(Math.PI * 45 / 360);
        this.camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 10000 );
        this.camera.position.set(0, 0, 100);
        this.scene.add(this.camera);


        const renderScene = new RenderPass( this.scene, this.camera );

        const params = {
            threshold: 0.1,
            strength: 0.025,
            radius: 0,
            exposure: 0.1
        };

        const bloomPass = new UnrealBloomPass( new THREE.Vector2( width, height ), 1.5, 0.4, 0.85 );
        bloomPass.threshold = params.threshold;
        bloomPass.strength = params.strength;
        bloomPass.radius = params.radius;

        const outputPass = new OutputPass();

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass( renderScene );
        this.composer.addPass( bloomPass );
        this.composer.addPass( outputPass );

        this.boids = generateBoids(60, width, height, this.scene);

        socket.on(this.name, (data) => {
            // console.log(data);
            if (data == undefined || data.length == 0) return;
            this.hands_position = data["hands_landmarks"];
            this.hands_handedness = data["hands_handedness"];
        });

        this.activated = true;
    }

    resume() {}
    pause() {}
    hide() {}

    windowResized() {
        this.renderer.setSize(windowWidth, windowHeight);
    }

    update() {
        for (let boid of this.boids) {
            boid.update(this.boids, this.hands_position, width, height);
        }
    }

    show() {

        console.log(this.scene);

        this.composer.render();
    }

}


export const life_as_a_boid = new Scene();
