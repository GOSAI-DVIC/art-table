import {
    awakeShow,
    awakeReset
} from "./states/awake.js";
import {
    sleepingShow,
    sleepingReset
} from "./states/sleeping.js";

let state = "awake";
let hands_position = [];
let font

export const walking_dog = new p5((sketch) => {
    sketch.name = "walking_dog"; // demo application for state machine structure
    sketch.activated = false;

    sketch.preload = () => {
    };

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height)
            .position(0, 0);
        sketch.activated = true;
        // Set up your app here
        socket.on(sketch.name, (data) => {
            if (data == undefined || data.length == 0) return;
            hands_position = data["hands_landmarks"];
        });
    };

    sketch.resume = () => {};
    sketch.pause = () => {};
    sketch.update = () => {};

    sketch.windowResized = () => resizeCanvas(windowWidth, windowHeight);

    sketch.show = () => {
        sketch.clear();

        sketch.push();
        sketch.translate(width / 2, height / 2);

        sketch.textSize(50);
        sketch.fill(255);
        sketch.textAlign(CENTER, CENTER);
        sketch.text(`State = ${state}`, 0, -height / 2 + 100);

        // state machine
        switch (state) {
            case "awake":
                state = awakeShow(sketch, hands_position);
                break;
            case "sleeping":
                state = sleepingShow(sketch);
                break;
            default:
                break;
        }

        sketch.pop();
    };
});