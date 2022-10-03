import {
    Score
} from "./components/score.js";

export const rainning_scores = new p5((sketch) => {
    sketch.name = "rainning_scores";
    sketch.z_index = 4;
    sketch.activated = false;

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height)
            .position(0, 0)
            .style("z-index", sketch.z_index);

        sketch.score = new Score();

        sketch.emit = (name, data) => {
            socket.emit(name, data);
        };

        sketch.activated = true;
    };

    sketch.resume = () => {
        sketch.score = new Score();
    };
    sketch.pause = () => {};

    sketch.windowResized = () => {
        sketch.resizeCanvas(windowWidth, windowHeight);
    };

    sketch.update = () => {
        sketch.score.update();
    };

    sketch.show = () => {
        sketch.clear();
        sketch.score.show(sketch);
    };
});
