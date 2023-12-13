import {
    TorchPointer
} from "./components/pointer.js";

import {
    Button
} from "./components/button.js";

import {
    Toggle
} from "./components/toggle.js";

import {
    ColorPicker
} from "./components/colorPicker.js";

import {
    paintingArea
} from "./components/painting.js";

import { project2DPoint } from "/gosai/libs/utils.js"

export const paintstorch = new p5((sketch) => {
    sketch.name = "paintstorch";
    sketch.z_index = 20;
    sketch.activated = false;
    let hands_position = [];
    let hands_handedness = [];
    let hands_sign = [];
    let pointers = [];

    sketch.defaultPointerStyle = "cross";
    sketch.isDrawing = false;
    sketch.isErasing = false;
    sketch.mode = 0;
    sketch.currentCornerIndex = 3;
    sketch.processing = false;

    let processButton;
    let drawToggle;
    let eraseToggle;
    let outlineStartButton;
    let nextCornerButton;
    let clearButton;

    let colorPicker;
    // 0: Select the area of interest
    // 1: Display the GUI
    // 2: Hide everything to take a photo

    let corners = [[100, 100], [1500, 100], [1500, 1200], [100, 1200]];
    sketch.cameraToDisplayMatrix = [];

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height)
            .position(0, 0)
            .style("z-index", sketch.z_index);

        socket.on(sketch.name, (payload) => {
            // console.log(data);

            let data = payload["data"];
            let type = payload["type"];
            if (type == "hand_pose") {
                if (data == undefined || data.length == 0) return;
                hands_position = data["hands_landmarks"];
                hands_handedness = data["hands_handedness"];
                hands_sign = data["hands_sign"];
                let frame_size = data["frame_size"];

                // Update pointers
                if (pointers.length > hands_position.length) {
                    pointers = pointers.slice(0, hands_position.length);
                }

                pointers.forEach((pointer, index) => {
                    let hand_pose = hands_position[index].map((point) => {
                        return sketch.cameraToDisplayMatrix.length == 0 ? [-0.2 + 1.4 * point[0] * width, -0.2 + 1.4 * point[1] * height] : project2DPoint([point[0] * frame_size[0], point[1] * frame_size[1]], sketch.cameraToDisplayMatrix);
                    });

                    pointer.updateHandData(hand_pose, hands_sign[index]);
                });


                if (pointers.length < hands_position.length) {
                    for (let i = pointers.length; i < hands_position.length; i++) {
                        let pointer = new TorchPointer(sketch.defaultPointerStyle);

                        let hand_pose = hands_position[i].map((point) => {
                            return sketch.cameraToDisplayMatrix.length == 0 ? [-0.2 + 1.4 * point[0] * width, -0.2 + 1.4 * point[1] * height] : project2DPoint([point[0] * frame_size[0], point[1] * frame_size[1]], sketch.cameraToDisplayMatrix);
                        });
                        pointer.updateHandData(hand_pose, hands_sign[i]);
                        pointers.push(pointer);
                    }
                }
            } else if (type == "calibration") {
                console.log(data);
                if (data == undefined || data == null) return;
                console.log(data);
                sketch.cameraToDisplayMatrix = data["camera_to_display_matrix"];
            }
        });

        colorPicker = new ColorPicker(width - 450, 500, 600, 800);

        drawToggle = new Toggle(width - 450 - 300 + 140, 1050, 280, 100, "Draw", sketch.color("hsl(200, 50%, 50%)"));
        drawToggle.setOnClick(() => {
            sketch.isDrawing = drawToggle.active;
            if (sketch.isDrawing) {
                eraseToggle.active = false;
                sketch.isErasing = false;
            }
        });

        eraseToggle = new Toggle(width - 450 + 300 - 140, 1050, 280, 100, "Erase", sketch.color("hsl(330, 50%, 50%)"));
        eraseToggle.setOnClick(() => {
            sketch.isErasing = eraseToggle.active;
            if (sketch.isErasing) {
                drawToggle.active = false;
                sketch.isDrawing = false;
            }
        });

        clearButton = new Button(width - 450, 1200, 600, 100, "Clear", sketch.color("hsl(0, 50%, 50%)"));
        clearButton.setOnClick(() => {
            paintingArea.clear();
        });

        processButton = new Button(width - 450, 1500, 600, 100, "Process", sketch.color("hsl(20, 50%, 50%)"));
        processButton.setOnClick(sketch.process);

        outlineStartButton = new Button(width - 450, 1350, 600, 100, "Select Outline", sketch.color("hsl(125, 50%, 50%)"));
        outlineStartButton.setOnClick(() => {
            processButton.visible = false;
            drawToggle.active = false;
            sketch.isDrawing = false;

            sketch.disableElements();
            outlineStartButton.enabled = true;
            nextCornerButton.enabled = true;
            nextCornerButton.text = "Next Corner";

            sketch.mode = 0;
            sketch.currentCornerIndex = 0;
            corners = [];
            pointers.forEach((pointer) => {
                pointer.displayStyle = "cross";
            });
            sketch.defaultPointerStyle = "cross";
        });

        nextCornerButton = new Button(width - 450, 1500, 600, 100, "Next Corner", sketch.color("hsl(20, 50%, 50%)"));
        nextCornerButton.setOnClick(() => {
            nextCornerButton.visible = false;
            sketch.currentCornerIndex++;
            if(sketch.currentCornerIndex == 3) {
                nextCornerButton.text = "Finish";
            } else if (sketch.currentCornerIndex == 4) {
                sketch.mode = 1;
                sketch.enableElements();
                processButton.visible = true;
                pointers.forEach((pointer) => {
                    pointer.displayStyle = "bubble";
                });
                sketch.defaultPointerStyle = "bubble";

                paintingArea.set(corners);

                if (!drawToggle.active) drawToggle.onClick();
            }
        });
        // colorPicker.enable();
        // sketch.enableElements();
        socket.emit("application-paintstorch-get_calibration_data");
        processButton.visible = false;
        outlineStartButton.enabled = true;
        // nextCornerButton.visible = false;
        nextCornerButton.enabled = true;
        sketch.activated = true;
        sketch.socket = socket;
    };

    sketch.resume = () => {};
    sketch.pause = () => {};

    sketch.process = () => {
        sketch.processing = true;
        let hints = paintingArea.getImg();
        setTimeout(() => {
            sketch.socket.emit("application-paintstorch-paint", {
                "drawing_coords": corners,
                "screen_size": [sketch.width, sketch.height],
                "canvas_coords": paintingArea.coords,
                "hints": hints
            });
        }, 1000);
        setTimeout(() => {
            sketch.processing = false;
        }, 2000);
    }

    sketch.enableElements = () => {
        processButton.enabled = true;
        drawToggle.enabled = true;
        eraseToggle.enabled = true;
        clearButton.enabled = true;
        outlineStartButton.enabled = true;
        nextCornerButton.enabled = true;
        colorPicker.enable();
    }

    sketch.disableElements = () => {
        processButton.enabled = false;
        drawToggle.enabled = false;
        eraseToggle.enabled = false;
        clearButton.enabled = false;
        outlineStartButton.enabled = false;
        nextCornerButton.enabled = false;
        colorPicker.disable();
    }

    sketch.windowResized = () => {
        sketch.resizeCanvas(windowWidth, windowHeight);
    };


    sketch.isProcessingReady = () => {
        return sketch.mode == 1 && corners.length == 4;
    }

    sketch.update = () => {
        if (sketch.cameraToDisplayMatrix.length == 0) return;
        pointers.forEach((pointer) => {
            pointer.drawing = sketch.isDrawing;
            pointer.pointerSize = colorPicker.sizeSlider.sizeValue;
            pointer.pointerColor = `hsl(${colorPicker.hueSlider.hueValue}, ${colorPicker.saturationSlider.saturationValue}%, ${colorPicker.luminositySlider.luminosityValue}%)`
            pointer.update();

            processButton.enabled = sketch.isProcessingReady();

            processButton.update(pointer);
            drawToggle.update(pointer);
            eraseToggle.update(pointer);
            colorPicker.update(pointer);
            outlineStartButton.update(pointer);
            clearButton.update(pointer);
            nextCornerButton.update(pointer);

            if (paintingArea != undefined) paintingArea.update(pointer, sketch.isErasing);

            if (!pointer.hovering && pointer.released && sketch.mode == 0 ) {
                if (sketch.currentCornerIndex == corners.length) {
                    corners.push([pointer.x, pointer.y]);
                    nextCornerButton.visible = true;
                } else {
                    corners[sketch.currentCornerIndex] = [pointer.x, pointer.y];
                }
            }
        });
    };

    sketch.show = () => {
        sketch.clear();
        if (sketch.cameraToDisplayMatrix.length == 0) return;
        if (sketch.processing) {
            sketch.background(0);
            return;
        }
        processButton.display(sketch);
        eraseToggle.display(sketch);
        drawToggle.display(sketch);
        colorPicker.display(sketch);
        outlineStartButton.display(sketch);
        nextCornerButton.display(sketch);
        clearButton.display(sketch);
        pointers.forEach((pointer) => {
            pointer.display(sketch);
        });

        corners.forEach((corner) => {
            sketch.push();
            sketch.stroke("hsl(30, 60%, 50%)");
            sketch.strokeWeight(5);
            sketch.noFill();
            sketch.circle(corner[0], corner[1], 50);
            sketch.line(corner[0] - 50, corner[1], corner[0] + 50, corner[1]);
            sketch.line(corner[0], corner[1] - 50, corner[0], corner[1] + 50);
            sketch.pop();
        });
    };
});
