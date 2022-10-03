import {
    Theremine
} from "./components/theremine.js";

export const theremine = new p5((sketch) => {
    sketch.name = "theremine";
    sketch.z_index = 5;
    sketch.activated = false;

    let hands_position = [];
    let hands_handedness = [];
    let hands_sign = [];

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height)
            .position(0, 0)
            .style("z-index", sketch.z_index);

        sketch.theremine = new Theremine();

        socket.on(sketch.name, (data) => {
            if (data == undefined || data.length == 0) return;
            hands_position = data["hands_landmarks"];
            hands_handedness = data["hands_handedness"];
            hands_sign = data["hands_sign"];
        });

        sketch.emit = (name, data) => {
            socket.emit(name, data);
        };

        sketch.activated = true;
    };

    sketch.resume = () => {};
    sketch.pause = () => {};

    sketch.windowResized = () => {
        sketch.resizeCanvas(windowWidth, windowHeight);
    };

    sketch.update = () => {
        sketch.theremine.update_parameters(hands_position, hands_handedness, hands_sign);
        // console.log(sketch.theremine.toJSON());
        // if (sketch.theremine.is_valid())
        sketch.emit("theremine_play_wave", sketch.theremine.toJSON());
    };

    sketch.show = () => {
        sketch.clear();
        sketch.fill(255);
        sketch.noStroke();
        sketch.textSize(32);
        sketch.textAlign(sketch.CENTER, sketch.CENTER);
        sketch.text(parseInt(sketch.theremine.frequency), sketch.width - 30, 30);
        sketch.text(sketch.round(sketch.theremine.amplitude,2), 30, 30);
    };
});
