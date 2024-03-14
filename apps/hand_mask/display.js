import { project2DPoint } from "/gosai/libs/utils.js"
import {
    display_mask
} from "./components/mask.js";

export const hand_mask = new p5((sketch) => {
    sketch.name = "hand_mask";
    sketch.z_index = 500;
    sketch.activated = false;
    sketch.cameraToDisplayMatrix = [];
    let hands_position = [];

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height)
            .position(0, 0)
            .style("z-index", sketch.z_index);

            socket.on(sketch.name, (payload) => {
                let data = payload["data"];
                let type = payload["type"];
                if (type == "hand_pose") {
                    if (data == undefined || data.length == 0) return;
                    hands_position = data["hands_landmarks"];
                    let frame_size = data["frame_size"];

                    hands_position = [];
                    data["hands_landmarks"].forEach((hand, index) => {
                        let hand_pose = hand.map((point) => {
                            return sketch.cameraToDisplayMatrix.length == 0 ? [(-0.3 + point[0]) * width / 0.6, (-0.1 + point[1]) * height / 0.6] : project2DPoint([point[0] * frame_size[0], point[1] * frame_size[1]], sketch.cameraToDisplayMatrix);
                        });

                        hands_position.push(hand_pose);
                    });


                } else if (type == "calibration") {
                    if (data == undefined || data == null) return;
                    sketch.cameraToDisplayMatrix = data["camera_to_display_matrix"];
                }
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
        if(hands_position == undefined || hands_position.length == 0) return;
        sketch.fill(255, 0, 0);
        for (let i = 0; i < hands_position.length; i++) {
            let hand = hands_position[i];
            display_mask(sketch, hand);
        }
    };
});
