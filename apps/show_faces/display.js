import {
    display_face
} from "./components/face.js";

export const show_faces = new p5((sketch) => {
    sketch.name = "show_faces";
    sketch.z_index = 5;
    sketch.activated = false;
    let faces_position = [];

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height)
            .position(0, 0)
            .style("z-index", sketch.z_index);

        socket.on(sketch.name, (data) => {
            if (data == undefined || data.length == 0) return;
            faces_position = data["faces_landmarks"];
        });

        sketch.activated = true;
    };

    sketch.resume = () => {};
    sketch.pause = () => {};

    sketch.windowResized = () => {
        sketch.resizeCanvas(windowWidth, windowHeight);
    };

    sketch.update = () => {};

    sketch.show = () => {
        sketch.clear();
        if(faces_position == undefined || faces_position.length == 0) return;
        for (let i = 0; i < faces_position.length; i++) {
            display_face(sketch, faces_position[i]);
        }
    };
});
