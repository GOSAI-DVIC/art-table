import * as THREE from "https://unpkg.com/three@0.156.1/build/three.module.js";

import { generateHand, updateTubesPosition } from "./components/hands.js";

class Scene {
    constructor() {
        this.name = "fiber_body";
        this.z_index = 10;
        this.activated = false;
        this.hands_position = [];
        this.hands_handedness = [];
        this.hands = [];
        this.frameSize = [];
        this.matrix = [];
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
        this.camera.position.set(0, 0, 1000);
        this.camera.lookAt(0, 0, 0);
        this.scene.add(this.camera);


        socket.on(this.name, (payload) => {
            // console.log(data);
            if (payload == undefined) return;
            if (payload["type"] == "hand_pose") {
                let data = payload["data"];
                this.hands_position = data["hands_landmarks"];
                this.hands_handedness = data["hands_handedness"];
                this.frameSize = data["frame_size"];
                if (this.hands_position.length > this.hands.length) {
                    for (let i = this.hands.length; i < this.hands_position.length; i++) {
                        if (this.hands_position[i] == 0) continue;
                        let hand = generateHand(this.hands_position[i], this.frameSize[0], this.frameSize[1]);
                        this.hands.push(hand);
                        this.scene.add(hand);
                    }
                }
            }

            if (payload["type"] == "calibration") {
                this.matrix = payload["data"]["matrix"];
            }
            // else if (this.hands_position.length < this.hands.length) {
            //     for (let i = this.hands_position.length; i < this.hands.length; i++) {
            //         let hand = this.hands.pop();
            //         this.scene.remove(hand)
            //     }
            // }
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
        for (let i = 0; i < this.hands_position.length; i++) {
            if (this.hands_position[i] == 0) continue;
            this.hands[i].visible = true;
            updateTubesPosition(this.hands_position[i], this.hands[i], this.frameSize[0], this.frameSize[1]);
        }
        for (let i = this.hands_position.length; i < this.hands.length; i++) {
            this.hands[i].visible = false;
        }
    }

    show() {
        // Transform the scene based on this.matrix
        let m = this.matrix;
        if (matrix.length > 0) {
            let matrix = new THREE.Matrix4().set(
                m[0][0], m[0][1], 0, m[0][2],
                m[1][0], m[1][1], 0, m[1][2],
                0,       0,       1, 0,
                m[2][0], m[2][1], 0, m[2][2]
            );
            this.camera.projectionMatrix = matrix;
        }

        this.renderer.render(this.scene, this.camera);
    }

}


export const fiber_body = new Scene();
