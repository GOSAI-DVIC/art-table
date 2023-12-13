import {
    display_face
} from "./components/face.js";

export const show_face_detection = new p5((sketch) => {
    sketch.name = "show_face_detection";
    sketch.z_index = 5;
    sketch.activated = false;
    let faces_detections = [];

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height)
            .position(0, 0)
            .style("z-index", sketch.z_index);

        socket.on(sketch.name, (data) => {
            if (data == undefined || data.length == 0) return;
            faces_detections = data["faces_detections"];
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
        if(faces_detections == undefined || faces_detections.length == 0) return;
        for (let i = 0; i < faces_detections.length; i++) {
            display_face(sketch, faces_detections[i]);
        }
    };
});
