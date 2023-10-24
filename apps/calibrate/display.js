import {
    display_hand
} from "./components/hand.js";

import {
    project2DPoint, projectP5Context
} from "/gosai/art_table/platform/src/libs/utils.js"

export const calibrate = new p5((sketch) => {
    sketch.name = "calibrate";
    sketch.z_index = 0
    sketch.activated = false;

    let scenarioIndex = 0;

    let arucoFileNames = [
        "aruco0.png",
        "aruco1.png",
        "aruco2.png",
        "aruco3.png"
    ]

    let arucoFiles = [];
    let arucoSize = 256;

    let arucoDisplayCoords = [];

    // let coords = [[[131.0, 208.0], [212.0, 210.0], [209.0, 290.0], [127.0, 289.0]], [[410.0, 212.0], [491.0, 213.0], [492.0, 294.0], [410.0, 293.0]], [[412.0, 57.0], [490.0, 57.0], [488.0, 136.0], [410.0, 135.0]], [[137.0, 52.0], [214.0, 54.0], [213.0, 133.0], [134.0, 131.0]]];
    // let ids = [3, 2, 1, 0];
    // let cameraToDisplayMatrix = [[3.164422226104663, 0.15063990243153333, -129.99313316096243], [-0.06157208467942557, 3.2250505314237574, -40.12721208994409], [-2.633518546379473e-05, 9.20139740831018e-05, 1.0]];

    let coords = [];
    let ids = [];
    let cameraToDisplayMatrix = [];
    let displayToCameraMatrix = [];
    let calibrationInProgress = false;

    let handsPose = [];
    let newHandsPose = [];
    let handsSign = [];
    let newHandsSign = [];
    let handsHandedness = [];
    let newHandsHandedness = [];
    let frameSize = [];

    let latchedTranslate = false;
    let latchingTranslateCount = 0;
    let initialCoord = [];
    let targetOffset = [0, 0];
    let currentOffset = [0, 0];

    let latchedScale = false;
    let latchingScaleCount = 0;
    let initialDistance = 0;
    let targetScale = 1;
    let currentScale = 1;

    let latchedRotate = false;
    let latchingRotateCount = 0;
    let initialAngle = 0;
    let targetAngle = 0;
    let currentAngle = 0;

    let latchedSize = false;
    let latchingSizeCount = 0;
    let initialSize = arucoSize;
    let targetSize = arucoSize;
    let currentSize = arucoSize;

    let latchedPlacement = false;
    let latchingPlacementCount = 0;
    let initialPlacement = [];
    let targetPlacement = [0.5, 0.5];
    let currentPlacement = [0.5, 0.5];

    let latchingTarget = 15;
    let latchingDecreaseSpeed = 2;
    let latchType = 0;

    sketch.set = (width, height, socket) => {
        sketch.width = width;
        sketch.height = height;

        sketch.selfCanvas = sketch.createCanvas(sketch.width, sketch.height).position(0, 0).style("z-index", sketch.z_index);

        sketch.socket = socket;

        for (let i = 0; i < arucoFileNames.length; i++) {
            arucoFiles.push(sketch.loadImage("./platform/home/apps/calibrate/components/aruco/" + arucoFileNames[i]));
        }

        sketch.updateCoords();

        sketch.socket.on(sketch.name, (payload) => {
            let data = payload["data"];
            let type = payload["type"];

            if (type == "calibration") {
                calibrationInProgress = false
                coords = data["coords"];
                ids = data["ids"];
                if (data["camera_to_display_matrix"].length >= cameraToDisplayMatrix.length) {
                    cameraToDisplayMatrix = data["camera_to_display_matrix"];
                    if (scenarioIndex == 0) scenarioIndex = 1;
                }
                if (data["display_to_camera_matrix"].length >= displayToCameraMatrix.length) {
                    displayToCameraMatrix = data["display_to_camera_matrix"];
                }
            }
            else if (type == "hand_pose") {
                newHandsPose = data["hands_landmarks"];
                newHandsSign = data["hands_sign"];
                newHandsHandedness = data["hands_handedness"];
                frameSize = data["frame_size"];
            }
        });

        // setInterval(() => {
        //     sketch.socket.emit("application-calibrate-calibrate_camera_display", arucoDisplayCoords);
        // }
        // , 100);

        sketch.activated = true;
    };

    sketch.mousePressed = () => {
        calibrationInProgress = true;
        setTimeout(() => {
            sketch.socket.emit("application-calibrate-calibrate_camera_display", arucoDisplayCoords);
        }, 300);
    };

    sketch.updateCoords = () => {

        for (let i = 0; i < 4; i++) {
            arucoDisplayCoords[i] = [];
            let x;
            let y;
            if (i == 0) {
                x = sketch.width/2 - 0.5 * currentPlacement[0] * sketch.width;
                y = sketch.height/2 - 0.5 * currentPlacement[1] * sketch.height;
            } else if (i == 1) {
                x = sketch.width/2 + 0.5 * currentPlacement[0] * sketch.width;
                y = sketch.height/2 - 0.5 * currentPlacement[1] * sketch.height;
            } else if (i == 2) {
                x = sketch.width/2 + 0.5 * currentPlacement[0] * sketch.width;
                y = sketch.height/2 + 0.5 * currentPlacement[1] * sketch.height;
            } else if (i == 3) {
                x = sketch.width/2 - 0.5 * currentPlacement[0] * sketch.width;
                y = sketch.height/2 + 0.5 * currentPlacement[1] * sketch.height;
            }
            arucoDisplayCoords[i].push([
                x - currentSize / 2,
                y - currentSize / 2,
            ]);
            arucoDisplayCoords[i].push([
                x + currentSize / 2,
                y - currentSize / 2,
            ]);
            arucoDisplayCoords[i].push([
                x + currentSize / 2,
                y + currentSize / 2,
            ]);
            arucoDisplayCoords[i].push([
                x - currentSize / 2,
                y + currentSize / 2,
            ]);
        }


        // sketch.translate(sketch.width / 2, sketch.height / 2);
        // sketch.scale(currentScale);
        // sketch.rotate(currentAngle);
        // sketch.translate(-sketch.width / 2, -sketch.height / 2);
        // sketch.translate(currentOffset[0], currentOffset[1]);

        // Equivalent to:
        let m = [
            [currentScale * Math.cos(currentAngle), -currentScale * Math.sin(currentAngle), currentOffset[0]],
            [currentScale * Math.sin(currentAngle), currentScale * Math.cos(currentAngle), currentOffset[1]],
            [0, 0, 1]
        ]

        for (let i = 0; i < arucoDisplayCoords.length; i++) {
            let coord = arucoDisplayCoords[i];
            for (let j = 0; j < coord.length; j++) {
                let point = coord[j];
                let x = point[0];
                let y = point[1];
                let z = 1;
                let newX = m[0][0] * x + m[0][1] * y + m[0][2] * z;
                let newY = m[1][0] * x + m[1][1] * y + m[1][2] * z;
                arucoDisplayCoords[i][j] = [newX, newY];
            }
        }
    }

    sketch.windowResized = () => {
        sketch.width = window.innerWidth;
        sketch.height = window.innerHeight;

        sketch.resizeCanvas(sketch.width, sketch.height);
    }

    sketch.resume = () => {};

    sketch.pause = () => {};

    sketch.update = () => {
        sketch.updateCoords();

        handsPose = newHandsPose;
        handsSign = newHandsSign;
        handsHandedness = newHandsHandedness;

        let f = 0.1;
        currentOffset = [
            currentOffset[0] * (1 - f) + targetOffset[0] * f,
            currentOffset[1] * (1 - f) + targetOffset[1] * f
        ]
        // console.log(currentOffset);

        currentScale = currentScale * (1 - f) + targetScale * f;
        // console.log(currentScale);

        currentAngle = currentAngle * (1 - f) + targetAngle * f;
        // console.log(currentAngle);

        currentSize = currentSize * (1 - f) + targetSize * f;
        // console.log(currentSize);

        currentPlacement = [
            currentPlacement[0] * (1 - f) + targetPlacement[0] * f,
            currentPlacement[1] * (1 - f) + targetPlacement[1] * f
        ]
        // console.log(currentPlacement);

        let numHands = handsPose.length;
        let numSigns = handsSign.length;
        if (numHands == 0) return;
        if (numSigns != numHands) return;

        let hand1 = handsPose[0];
        let hand2 = handsPose[1];

        let selectPoint;
        let handsDistance;
        let handsAngle;
        let amp = 1;
        if (numHands == 2 && handsSign[0][0] == "FIST" && handsSign[1][0] == "FIST") {
            selectPoint = [amp * sketch.width*(hand1[0][0] + hand2[0][0]) / 2, amp * sketch.height*(hand1[0][1] + hand2[0][1]) / 2];
            handsDistance = Math.sqrt(
                Math.pow(amp * sketch.width*(hand1[0][0] - hand2[0][0]), 2) +
                Math.pow(amp * sketch.height*(hand1[0][1] - hand2[0][1]), 2)
            );
            handsAngle = -Math.atan2(
                hand1[0][0] - hand2[0][0],
                hand1[0][1] - hand2[0][1]
            );
            if(latchType != 0) {
                latchedTranslate = false;
                latchedScale = false;
                latchedRotate = false;
                latchType = 0;
            }
        } else

        if (numHands == 1 && handsSign[0][0] == "FIST") {
            selectPoint = [amp * sketch.width*hand1[0][0], amp * sketch.height*hand1[0][1]];
            if(latchType != 1) {
                latchedTranslate = false;
                latchType = 1;
            }
        } else if (numHands == 2 && handsSign[0][0] == "FIST" && handsSign[1][0] != "FIST") {
            selectPoint = [amp * sketch.width*hand1[0][0], amp * sketch.height*hand1[0][1]];
            if(latchType != 2) {
                latchedTranslate = false;
                latchType = 2;
            }
        } else if (numHands == 2 && handsSign[1][0] == "FIST" && handsSign[0][0] != "FIST") {
            selectPoint = [amp * sketch.width*hand2[0][0], amp * sketch.height*hand2[0][1]];
            if(latchType != 3) {
                latchedTranslate = false;
                latchType = 3;
            }
        }

        if (selectPoint != undefined) {
            if(latchingTranslateCount < latchingTarget) {
                latchingTranslateCount++;
            }

            if (!latchedTranslate) {
                if (latchingTranslateCount >= latchingTarget) {
                    latchedTranslate = true;
                    initialCoord = selectPoint;
                }
            }

            if(latchedTranslate) {
                targetOffset = [targetOffset[0] + selectPoint[0] - initialCoord[0], targetOffset[1] + selectPoint[1] - initialCoord[1]];
                initialCoord = selectPoint;
            }
        } else {
            latchingTranslateCount -= latchingDecreaseSpeed;
        }

        if (latchingTranslateCount < 0)  {
            latchingTranslateCount = 0;
            latchedTranslate = false;
        }

        if (handsDistance != undefined) {
            if(latchingScaleCount < latchingTarget) {
                latchingScaleCount++;
            }

            if (!latchedScale) {
                if(latchingScaleCount >= latchingTarget) {
                    latchedScale = true;
                    initialDistance = handsDistance;
                }
            }

            if(latchedScale) {
                targetScale = targetScale * handsDistance / initialDistance;
                initialDistance = handsDistance;
            }
            // console.log(targetScale);
        } else {
            latchingScaleCount -= latchingDecreaseSpeed;
        }

        if (latchingScaleCount < 0)  {
            latchingScaleCount = 0;
            latchedScale = false;
        }

        if (handsAngle != undefined) {
            if(latchingRotateCount < latchingTarget) {
                latchingRotateCount++;
            }

            if (!latchedRotate) {
                if(latchingRotateCount >= latchingTarget) {
                    latchedRotate = true;
                    initialAngle = handsAngle;
                }
            }

            if(latchedRotate) {
                // targetAngle = targetAngle + handsAngle - initialAngle;
                targetAngle = targetAngle + handsAngle - initialAngle;
                initialAngle = handsAngle;
            }
            // console.log(targetScale);
        } else {
            latchingRotateCount -= latchingDecreaseSpeed;
        }

        if (latchingRotateCount < 0)  {
            latchingRotateCount = 0;
            latchedRotate = false;
        }


        let indexDistance;
        if (numHands == 2 && handsSign[0][0] == "INDEX" && handsSign[1][0] == "INDEX") {
            indexDistance = Math.sqrt(
                Math.pow(amp * sketch.width*(hand1[8][0] - hand2[8][0]), 2) +
                Math.pow(amp * sketch.height*(hand1[8][1] - hand2[8][1]), 2)
            );

            if(latchType != 4) {
                latchedSize = false;
                latchType = 4;
            }
        }

        if (indexDistance != undefined) {
            if(latchingSizeCount < latchingTarget) {
                latchingSizeCount++;
            }

            if (!latchedSize) {
                if(latchingSizeCount >= latchingTarget) {
                    latchedSize = true;
                    initialSize = indexDistance;
                }
            }

            if(latchedSize) {
                targetSize = targetSize * indexDistance / initialSize;
                initialSize = indexDistance;
            }
            // console.log(targetSize);
        } else {
            latchingSizeCount -= latchingDecreaseSpeed;
        }

        if (latchingSizeCount < 0)  {
            latchingSizeCount = 0;
            latchedSize = false;
        }

        let indexPlacement;
        if (numHands == 2 && handsSign[0][0] == "TWO" && handsSign[1][0] == "TWO") {
            indexPlacement = [
                amp * (hand1[8][0] - hand2[8][0]),
                amp * (hand1[8][1] - hand2[8][1])
            ];

            if(latchType != 5) {
                latchedPlacement = false;
                latchType = 5;
            }
        }

        amp = 0.05;
        if (indexPlacement != undefined) {
            if(latchingPlacementCount < latchingTarget) {
                latchingPlacementCount++;
            }

            if (!latchedPlacement) {
                if (latchingPlacementCount >= latchingTarget) {
                    latchedPlacement = true;
                    initialPlacement = indexPlacement;
                }
            }

            if(latchedPlacement) {
                targetPlacement = [targetPlacement[0] + indexPlacement[0] - initialPlacement[0], targetPlacement[1] + indexPlacement[1] - initialPlacement[1]];
                initialPlacement = indexPlacement;
            }
        } else {
            latchingPlacementCount -= latchingDecreaseSpeed;
        }

        if (latchingPlacementCount < 0)  {
            latchingPlacementCount = 0;
            latchedPlacement = false;
        }

    };

    sketch.show = () => {
        sketch.clear();
        sketch.push();
        if (calibrationInProgress) {
            sketch.background(255);
        }

        sketch.noFill();

        sketch.push();
        sketch.stroke(0, 0, 255, 50*latchingTranslateCount/latchingTarget);
        sketch.strokeWeight(20);
        sketch.rect(0, 0, sketch.width, sketch.height);
        sketch.pop();


        sketch.push();
        sketch.stroke(255, 0, 0, (25*latchingScaleCount + 25*latchingRotateCount)/latchingTarget);
        sketch.strokeWeight(20);
        sketch.rect(0, 0, sketch.width, sketch.height);
        sketch.pop();

        sketch.push();
        sketch.stroke(255, 255, 0, 50*latchingSizeCount/latchingTarget);
        sketch.strokeWeight(20);
        sketch.rect(0, 0, sketch.width, sketch.height);
        sketch.pop();

        sketch.push();
        sketch.stroke(0, 255, 255, 50*latchingPlacementCount/latchingTarget);
        sketch.strokeWeight(20);
        sketch.rect(0, 0, sketch.width, sketch.height);
        sketch.pop();

        sketch.push();

        if(!calibrationInProgress && cameraToDisplayMatrix.length > 0) {
            sketch.push();

            sketch.stroke(255, 0, 0);
            sketch.strokeWeight(2);
            sketch = projectP5Context(sketch, cameraToDisplayMatrix);

            let crossSize = 10;
            let crossCenter = [frameSize[0]*0.5, frameSize[1]*0.5];
            let crossTop = [crossCenter[0], crossCenter[1] - crossSize];
            let crossBottom = [crossCenter[0], crossCenter[1] + crossSize];
            let crossLeft = [crossCenter[0] - crossSize, crossCenter[1]];
            let crossRight = [crossCenter[0] + crossSize, crossCenter[1]];

            let w = frameSize[0]/8;
            let h = frameSize[1]/8;

            let crossTopLeft = [crossCenter[0] - w, crossCenter[1] - h];
            let crossTopRight = [crossCenter[0] + w, crossCenter[1] - h];
            let crossBottomLeft = [crossCenter[0] - w, crossCenter[1] + h];
            let crossBottomRight = [crossCenter[0] + w, crossCenter[1] + h];


            sketch.line(crossLeft[0], crossLeft[1], crossRight[0], crossRight[1]);
            sketch.line(crossTop[0], crossTop[1], crossBottom[0], crossBottom[1]);

            sketch.line(crossTopLeft[0], crossTopLeft[1], crossTopRight[0], crossTopRight[1]);
            sketch.line(crossTopLeft[0], crossTopLeft[1], crossBottomLeft[0], crossBottomLeft[1]);
            sketch.line(crossBottomLeft[0], crossBottomLeft[1], crossBottomRight[0], crossBottomRight[1]);
            sketch.line(crossTopRight[0], crossTopRight[1], crossBottomRight[0], crossBottomRight[1]);

            sketch.pop();
        }

        if (cameraToDisplayMatrix.length > 0) {
            sketch = projectP5Context(sketch, cameraToDisplayMatrix);
        }

        sketch.stroke(0, 255, 0, 60);
        sketch.strokeWeight(20);
        sketch.noFill();
        if(!calibrationInProgress) {
            for (let i = 0; i < coords.length; i++) {
                // sketch.rect(coords[i][0][0]-10, coords[i][0][1]-10, coords[i][2][0] - coords[i][0][0]+20, coords[i][2][1] - coords[i][0][1]+20);
                sketch.beginShape();
                let offset = 20;
                sketch.vertex(coords[i][0][0] - offset, coords[i][0][1] - offset);
                sketch.vertex(coords[i][1][0] + offset, coords[i][1][1] - offset);
                sketch.vertex(coords[i][2][0] + offset, coords[i][2][1] + offset);
                sketch.vertex(coords[i][3][0] - offset, coords[i][3][1] + offset);
                sketch.endShape(sketch.CLOSE);
            }
        }


        sketch.stroke(0, 100, 200);
        sketch.noFill();
        sketch.strokeWeight(10);
        for (let i = 0; i < handsPose.length; i++) {
            display_hand(sketch, handsPose[i], handsHandedness[i], handsSign[i], true, true, frameSize);
            let dir = [handsPose[i][8][0] - handsPose[i][6][0], handsPose[i][8][1] - handsPose[i][6][1]];
            dir = [frameSize[0]*dir[0], frameSize[1]*dir[1]];
            let index_point = [handsPose[i][8][0]*frameSize[0], handsPose[i][8][1]*frameSize[1]];
            sketch.circle(index_point[0] + dir[0] / 4, index_point[1] + dir[1] / 4, 10);

        }

        sketch.pop();


        // sketch.translate(sketch.width / 2, sketch.height / 2);
        // sketch.scale(currentScale);
        // sketch.rotate(currentAngle);
        // sketch.translate(-sketch.width / 2, -sketch.height / 2);

        // sketch.translate(currentOffset[0], currentOffset[1]);

        sketch.push();
        sketch.textSize(32);
        sketch.fill(255);
        sketch.textAlign(sketch.CENTER);
        for (let i = 0; i < handsSign.length; i++) {
            sketch.text(handsSign[i][0], sketch.width / 2, sketch.height / 2 + 32*i);
        }
        sketch.text(currentPlacement[0], sketch.width / 2, sketch.height / 2 + 32*2);
        sketch.pop();


        sketch.stroke(255);
        sketch.strokeWeight(calibrationInProgress ? 100 : 10);


        for (let i = 0; i < arucoFiles.length; i++) {
            sketch.rect(arucoDisplayCoords[i][0][0], arucoDisplayCoords[i][0][1], currentSize, currentSize);
        }

        if(calibrationInProgress) {
            for (let i = 0; i < arucoFiles.length; i++) {
                sketch.image(arucoFiles[i], arucoDisplayCoords[i][0][0], arucoDisplayCoords[i][0][1], currentSize, currentSize);
            }
        }

        sketch.pop();
    };
});
