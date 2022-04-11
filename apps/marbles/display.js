import {
    show_marbles,
    move_marble_from_hand,
    move_marble_from_marbles,
    move_marble_from_walls
} from "./components/marble.js";

export const marbles = new p5((sketch) => {
    sketch.name = "marbles";
    sketch.z_index = 5;
    sketch.activated = false;

    let hands_position = [];
    let marbles = [];

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height)
            .position(0, 0)
            .style("z-index", sketch.z_index);

        socket.on(sketch.name, (data) => {
            if (data == undefined || data.length == 0) return;
            hands_position = [];

            // hands_position = data["hands_landmarks"];

            if (data["hands_landmarks"] != undefined && data["hands_landmarks"].length != 0) hands_position.concat(data["right_hand_pose"]);
            if (data["right_hand_pose"] != undefined && data["right_hand_pose"].length != 0) hands_position.push(data["right_hand_pose"]);
            if (data["left_hand_pose"] != undefined && data["left_hand_pose"].length != 0) hands_position.push(data["left_hand_pose"]);
        });

        for (let i = 0; i < 1000; i++) {
            marbles.push({
                x: Math.random() * sketch.width,
                y: Math.random() * sketch.height,
                vx: 0,
                vy: 0,
                ax: 0,
                ay: 0,
                r: 20 + Math.random() * 10,
                color: sketch.color(Math.random() * 255, Math.random() * 255, Math.random() * 255)
            });
        }

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
        show_marbles(marbles, sketch);
        sketch.strokeWeight(2);
        sketch.stroke(255, 255, 0);
        for (let i = 0; i < marbles.length; i++) {
            marbles[i] = move_marble_from_marbles(marbles, marbles[i], i, sketch);
        }
        sketch.stroke(255, 0, 0);
        for (let hand of hands_position) {
            for (let i = 0; i < marbles.length; i++) {
                marbles[i] = move_marble_from_hand(marbles[i], hand, sketch);
            }
        }
        for (let i = 0; i < marbles.length; i++) {
            marbles[i] = move_marble_from_walls(marbles[i], sketch);
        }
    };
});

function sum(arr) {
    return arr.reduce((a, b) => a + b, 0);
}
