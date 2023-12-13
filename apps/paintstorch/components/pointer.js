const displayStyles = ["hidden", "bubble", "cross"]
const acceptedSigns = ["INDEX", "OPEN_HAND", "TWO", "SPIDERMAN"]

export class TorchPointer {
    constructor(displayStyle = "cross") {
        // A click is a single press and release with no movement in between
        this.clicked = false;
        // A press is the first frame the pointer is down
        this.pressed = false;
        // A release is the first frame the pointer is up
        this.released = false;

        this.pointerDown = false;

        // Dragging is true if the pointer is down and moved more than a certain distance
        this.dragging = false;
        this.hovering = false;
        this.drawing = false;

        this.x = 0;
        this.y = 0;
        this.previousX = 0;
        this.previousY = 0;

        this.pointerDownX = 0;
        this.pointerDownY = 0;

        this.displayStyle = displayStyle

        // Down and up thresholds are used to determine if the pointer is down or up
        // Creates a hysteresis effect to avoid flickering
        this.downThreshold = 0.8;
        this.upThreshold = 1.1;
        this.currentThreshold = 0;

        // Don't change the state for only one frame
        this.downStateChangeCount = 0;
        this.upStateChangeCount = 0;
        this.stateChangeThreshold = 5;

        // Cumulated Distance threshold is the max distance the pointer can move before it is not considered a click anymore
        this.cumulatedDistanceThreshold = 50;
        this.cumulatedDitance = 0;

        this.color = "hsl(0, 100%, 100%)";
        this.pointerColor = this.color;
        this.pointerSize = 50;

        this.hand_pose = undefined;
        this.hand_sign = undefined;

        this.debug = false;
    }

    update() {
        // Reset state every frame
        this.clicked = false;
        this.pressed = false;
        this.released = false;
        this.hovering = false;

        if (this.hand_pose === undefined || this.hand_sign === undefined) {
            return;
        }

        if (this.hand_pose.length == 0 || this.hand_sign.length == 0) {
            return;
        }

        // Compute the current threshold (distance between thumb and index finger)
        this.currentThreshold = this.computeThreshold(this.hand_pose);

        let correctSign = acceptedSigns.includes(this.hand_sign[0]);

        // Compute how much the pointer has moved
        let index_finger_tip = this.hand_pose[8];

        let d = Math.sqrt(
            (index_finger_tip[0] - this.x) ** 2 +
            (index_finger_tip[1] - this.y) ** 2
        );

        if (!this.pointerDown && this.currentThreshold < this.downThreshold && correctSign) {
            if (this.downStateChangeCount < this.stateChangeThreshold) {
                this.downStateChangeCount += 1;
            } else {
                this.downStateChangeCount = 0;
                this.pointerDownX = index_finger_tip[0];
                this.pointerDownY = index_finger_tip[1];
                this.pointerDown = true;
                this.pressed = true;
                if (this.debug) console.log("pressed");
            }
        } else if (this.pointerDown && this.currentThreshold < this.downThreshold && correctSign) {
            this.cumulatedDitance += d;
            this.cumulatedDitance = Math.max(this.cumulatedDitance-1, 0);
            if (this.cumulatedDitance > this.cumulatedDistanceThreshold) {
                if(!this.dragging && this.debug) console.log("dragging");
                this.dragging = true;
            }
        } else if (this.pointerDown && (this.currentThreshold > this.upThreshold || !correctSign)) {
            if (this.upStateChangeCount < this.stateChangeThreshold) {
                this.upStateChangeCount += 1;
            } else {
                this.upStateChangeCount = 0;
                this.pointerDown = false;
                this.released = true;
                this.cumulatedDitance = 0;
                if (this.debug) console.log("released");

                if (!this.dragging) {
                    this.clicked = true;
                    if (this.debug) console.log("clicked");
                }
                this.dragging = false;
            }
        }

        this.previousX = this.x;
        this.previousY = this.y;
        // Update pointer position
        this.x = index_finger_tip[0];
        this.y = index_finger_tip[1];
    }

    updateHandData(hand_pose, hand_sign) {
        this.hand_pose = hand_pose;
        this.hand_sign = hand_sign;
    }


    computeThreshold(hand_pose) {
        let thumb_tip = hand_pose[4];
        let index_finger_mcp = hand_pose[5];
        let index_finger_pip = hand_pose[6];
        let index_finger_dip = hand_pose[7];

        let reference_length = Math.sqrt(
            (index_finger_mcp[0] - index_finger_pip[0]) ** 2 +
            (index_finger_mcp[1] - index_finger_pip[1]) ** 2
        );

        let pointing_length_0 = Math.sqrt(
            (index_finger_pip[0] - thumb_tip[0]) ** 2 +
            (index_finger_pip[1] - thumb_tip[1]) ** 2
        );

        let pointing_length_1 = Math.sqrt(
            (index_finger_mcp[0] - thumb_tip[0]) ** 2 +
            (index_finger_mcp[1] - thumb_tip[1]) ** 2
        );

        let pointing_length_2 = Math.sqrt(
            (index_finger_dip[0] - thumb_tip[0]) ** 2 +
            (index_finger_dip[1] - thumb_tip[1]) ** 2
        );

        let pointing_length = Math.min(pointing_length_0, pointing_length_1);
        pointing_length = Math.min(pointing_length, pointing_length_2);

        return pointing_length / reference_length;
    }

    setDisplayStyle(style) {
        if (displayStyles.includes(style)) {
            this.displayStyle = style;
        }
    }

    display(sketch) {
        if (this.displayStyle === "hidden") {
            return;
        } else if (this.displayStyle === "bubble") {
            this.displayZoomingBubble(sketch);
        } else if (this.displayStyle === "cross") {
            this.displayScreenCross(sketch);
        }
    }

    displayZoomingBubble(sketch) {
        sketch.push();

        sketch.strokeWeight(5);

        if(this.pointerDown) {
            sketch.noStroke();
            sketch.fill((this.hovering | !this.drawing)  ? "white" : this.pointerColor);
            sketch.circle(this.x, this.y, this.pointerSize);
        } else {
            sketch.noFill();
            sketch.stroke(this.color);
            sketch.circle(this.x, this.y, this.pointerSize + 50.0 * this.currentThreshold);
        }

        sketch.pop();
    }

    displayScreenCross(sketch) {
        sketch.push();

        sketch.strokeWeight(5);

        if(this.pointerDown) {
            sketch.noStroke();
            sketch.fill((this.hovering | !this.drawing) ? "white" : this.pointerColor);
            sketch.circle(this.x, this.y, this.pointerSize);
        } else {
            sketch.noFill();
            sketch.stroke(this.color);
            sketch.circle(this.x, this.y, this.pointerSize + 50.0 * this.currentThreshold);
        }

        sketch.line(0, this.y, this.x, this.y);
        sketch.line(this.x, 0, this.x, this.y);
        sketch.line(sketch.width, this.y, this.x, this.y);
        sketch.line(this.x, sketch.height, this.x, this.y);

        sketch.pop();
    }
}
