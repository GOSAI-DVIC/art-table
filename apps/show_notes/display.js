import {
    Page
} from "./components/page.js";

export const show_notes = new p5((sketch) => {
    sketch.name = "show_notes";
    sketch.z_index = 3;
    sketch.activated = false;

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height)
            .position(0, 0)
            .style("z-index", sketch.z_index);


        sketch.emit = (name, data) => {
            socket.emit(name, data);
        };

        sketch.page = new Page(sketch);
        sketch.activated = true;
    };

    sketch.pause = () => {
    };

    sketch.windowResized = () => {
        sketch.resizeCanvas(windowWidth, windowHeight);
    };

    sketch.update = () => {
    };

    sketch.show = () => {
        // sketch.clear();
        // sketch.page.show(sketch);
    };
});
