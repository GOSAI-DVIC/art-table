import {
    display_hand
} from "./components/hand.js";
import {
    shiftPointsAwayFromHand, generatePoints, generateDirections, shiftDirectionsRandomly, computeTriangles, movePoints, generateColors
} from "./components/triangles.js";

export const pulsing_triangles = new p5((sketch) => {
    sketch.name = "pulsing_triangles";
    sketch.z_index = 0;
    sketch.activated = false;
    let hands_position = [];
    let hands_handedness = [];
    let originalPoints = [];
    let points = [];
    let triangles = [];
    let directions = [];
    let colors = []

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height)
            .position(0, 0)
            .style("z-index", sketch.z_index);

        socket.on(sketch.name, (data) => {
            // console.log(data);
            if (data == undefined || data.length == 0) return;
            hands_position = data["hands_landmarks"];
            hands_handedness = data["hands_handedness"];
        });

        sketch.activated = true;

        // let a = generateTriangles(500, width, height);
        // originalPoints = a["points"];
        // points = a["points"];
        // triangles = a["triangles"];
        // delaunay = a["delaunay"];
        originalPoints = generatePoints(200, width, height);
        triangles = computeTriangles(originalPoints);
        directions = generateDirections(originalPoints);
        colors = generateColors(originalPoints);
    };

    sketch.resume = () => {};
    sketch.pause = () => {};

    sketch.windowResized = () => {
        sketch.resizeCanvas(windowWidth, windowHeight);
    };

    sketch.update = () => {
        let a = movePoints(originalPoints, directions, sketch.width, sketch.height);
        originalPoints = a["points"];
        directions = a["directions"];
        directions = shiftDirectionsRandomly(directions);
        points = originalPoints.slice();
        if (hands_position.length > 0) {
            for (let i = 0; i < hands_position.length; i++) {
                let hand = hands_position[i];
                let hand_handedness = hands_handedness[i];
                points = shiftPointsAwayFromHand(points, hand, hand_handedness, sketch.width, sketch.height);
            }
        }
        triangles = computeTriangles(points);
        // originalPoints = points;

    };

    sketch.show = () => {
        sketch.clear();

        sketch.noStroke();
        for (let i = 0; i < triangles.length; i+=3) {
            // let alpha = colors[triangles[i]*2];
            // let alpha = (colors[triangles[i]*2] + colors[triangles[i + 1]*2] + colors[triangles[i + 2]*2])/3;
            let alpha = (1-abs(width/2 - (points[triangles[i]*2] + points[triangles[i + 1]*2] + points[triangles[i + 2]*2])/3)/(0.5*width));
            let beta = (1-abs(height/2 - (points[triangles[i]*2 + 1] + points[triangles[i + 1]*2 + 1] + points[triangles[i + 2]*2 + 1])/3)/(0.5*height));

            // sketch.fill(100*alpha + beta*50, 55 + 200*alpha - beta*100, 255*alpha - beta*255, 255);
            sketch.fill(100, 200, 255, 255*alpha);
            // alpha at 1: #8a2387 beta at 1: #f27121  both at 1: #e94057

            // let color1 = sketch.color(138, 35, 135, 255);
            // let color2 = sketch.color(242, 113, 33, 255);

            // let color = sketch.lerpColor(color1, color2, alpha**2 - beta**2);

            // sketch.fill(color);

            let x1 = points[triangles[i]*2];
            let y1 = points[triangles[i]*2 + 1];
            let x2 = points[triangles[i + 1]*2];
            let y2 = points[triangles[i + 1]*2 + 1];
            let x3 = points[triangles[i + 2]*2];
            let y3 = points[triangles[i + 2]*2 + 1];


            sketch.triangle(
                x1, y1,
                x2, y2,
                x3, y3
            );
        }
    };
});
