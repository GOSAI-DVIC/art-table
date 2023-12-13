import { generateBoids } from "./components/boids.js";
import { computeCentroidAndRadius } from "./components/hand.js";
import * as THREE from "/gosai/libs/three/build/three.module.js";
import { EffectComposer } from "/gosai/libs/three/examples/jsm/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "/gosai/libs/three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { RenderPass } from "/gosai/libs/three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "/gosai/libs/three/examples/jsm/postprocessing/OutputPass.js";
import { GLTFLoader } from "/gosai/libs/three/examples/jsm/loaders/GLTFLoader.js";
import { project2DPoint } from "/gosai/libs/utils.js"

class Scene {
    constructor() {
        this.name = "life_as_a_boid";
        this.z_index = 10;
        this.activated = false;
        this.hands_position = [];
        // this.hands_handedness = [];
        this.boids = [];
        this.frameSize = [];
        this.cameraToDisplayMatrix = [];
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

        this.boids = generateBoids(100, width, height, this.scene);

        socket.on(this.name, (payload) => {
            let data = payload["data"];
            let type = payload["type"];

            if (type == "calibration") {
                let coords = data["coords"];
                console.log(coords);
                if (coords == undefined) {
                    setTimeout(() => this.requestCalibration(), 10000);
                    return;
                }
                if (coords.length < 4) {
                    setTimeout(() => this.requestCalibration(), 10000);
                    return;
                }
                this.cameraToDisplayMatrix = data["camera_to_display_matrix"];
            }
            else if (type == "hand_pose") {
                this.hands_position = data["hands_landmarks"];
                this.frameSize = data["frame_size"];
            }
        });

        this.activated = true;
        this.socket = socket;
        this.requestCalibration();
        // this.debugSphere = new THREE.Mesh( new THREE.SphereGeometry( 100, 16, 8 ), new THREE.MeshBasicMaterial( { color: 0xff0000 } ) );
        // this.scene.add( this.debugSphere );
    }

    requestCalibration() {
        this.socket.emit("application-life_as_a_boid-request_calibration");
    }

    resume() {
        this.socket.emit("application-life_as_a_boid-get_calibration_data");
    }
    pause() {}
    hide() {}

    windowResized() {
        this.renderer.setSize(windowWidth, windowHeight);
    }


    update() {
        let centroids = [];
        let radii = [];
        let hands_position = [];
        if (this.cameraToDisplayMatrix.length) {
            for (let hand_pose of this.hands_position) {
                let hand = [];
                for (let i = 0; i < hand_pose.length; i++) {
                    let [x, y] = project2DPoint([hand_pose[i][0] * this.frameSize[0], hand_pose[i][1] * this.frameSize[1]], this.cameraToDisplayMatrix);
                    hand.push([x, y]);
                }
                hands_position.push(hand);

                let [centroid, radius] = computeCentroidAndRadius(hand, this.frameSize, this.cameraToDisplayMatrix);
                centroids.push(centroid);
                radii.push(radius);
                // this.debugSphere.position.set(centroid.x - width/2, height/2 - centroid.y, 0);
                // circle(centroid.x, centroid.y, radius);
            }
        } else {
            for (let hand_pose of this.hands_position) {
                let hand = [];
                for (let i = 0; i < hand_pose.length; i++) {
                    let [x, y] = [hand_pose[i][0] * width, hand_pose[i][1] * height];
                    hand.push([x, y]);
                }
                hands_position.push(hand);

                let [centroid, radius] = computeCentroidAndRadius(hand, this.frameSize, this.cameraToDisplayMatrix);
                centroids.push(centroid);
                radii.push(radius);
                // this.debugSphere.position.set(centroid.x - width/2, height/2 - centroid.y, 0);
                // circle(centroid.x, centroid.y, radius);
            }
        }

        let distances = [];
        let closerBoids = [];
        for (let i = 0; i < this.boids.length; i++) {
            distances.push([]);
            closerBoids.push([]);
        }
        for (let i = 0; i < this.boids.length; i++) {
            for (let j = i+1; j < this.boids.length; j++) {
                let d = dist(this.boids[i].pos.x, this.boids[i].pos.y, this.boids[j].pos.x, this.boids[j].pos.y);
                distances[i].push(d);
                distances[j].push(d);
                if (d < this.boids[i].viewRadius) {
                    closerBoids[i].push(this.boids[j]);
                }
            }
        }

        for (let [i, boid] of this.boids.entries()) {
            boid.update(this.boids, hands_position, width, height, centroids, radii, distances[i], closerBoids[i]);
        }
    }

    show() {
        this.composer.render();
    }

}


export const life_as_a_boid = new Scene();
