let goDefaultNextStep = false;
let firstRun = true;
let energyBar = 100;
let index_x_a = 0;
let index_y_a = 0;
let previous_index_x_a = -width;
let previous_index_y_a = -height;

export function awakeShow(sketch, hands_position) {
    firstRun ? onEnter() : null

    //WRITE YOUR CODE HERE
    setDogPosition(hands_position)
    updateEnergyBarValue(sketch)
    showWalkingDog(sketch)

    if (energyBar == 0) {
        goDefaultNextStep = true;
    }

    if (goDefaultNextStep == true) {
        onExit()
        return "sleeping"
    }
    return "awake"
}

function onEnter() {
    firstRun = false;
    energyBar = 100;
}

function onExit() {
    firstRun = true;
    goDefaultNextStep = false;

}

export function awakeReset() {
    onExit()
}

function setDogPosition(hands_position) {
    if (hands_position.length != 0) {
        index_x_a = hands_position[0][8][0] * width - width / 2;
        index_y_a = hands_position[0][8][1] * height - height / 2;
    }
}

function updateEnergyBarValue(sketch) {
    if (energyBar > 0) {
        if (Math.abs(index_x_a - previous_index_x_a) > 5 && Math.abs(index_y_a - previous_index_y_a) > 5) {
            energyBar -= 1;
        }
        previous_index_x_a = index_x_a;
        previous_index_y_a = index_y_a;

        sketch.push();
        sketch.scale(2);
        sketch.translate(-50, -200);
        sketch.noFill();
        sketch.stroke(255);
        sketch.strokeWeight(2);
        sketch.rect(0, 0, 100, 10);
        sketch.fill(255);
        if (energyBar < 50) {
            //Orange
            sketch.fill(255, 165, 0);
        }
        if (energyBar < 25) {
            sketch.fill(255, 0, 0);
        }
        sketch.noStroke();
        sketch.rect(0, 0, energyBar, 10);
        sketch.pop();
    }
}

function showWalkingDog(sketch) {
    sketch.noStroke();
    sketch.push();
    sketch.translate(index_x_a - 250, index_y_a - 250);

    // draw the head
    sketch.fill(255, 204, 153);
    sketch.stroke(0);
    sketch.ellipse(250, 220, 100, 100);

    // draw the body

    sketch.fill(255, 204, 153);
    sketch.noStroke(0);
    sketch.ellipse(175, 275, 200, 80);

    // draw the ears
    sketch.fill(100, 50, 0);
    sketch.stroke(0);
    sketch.triangle(270, 170, 300, 180, 290, 210);
    sketch.triangle(230, 170, 200, 180, 210, 210);

    // draw the eyes
    sketch.fill(255);
    sketch.stroke(0);
    sketch.ellipse(235, 210, 20, 20);
    sketch.ellipse(265, 210, 20, 20);
    sketch.fill(0);
    sketch.ellipse(235, 210, 10, 10);
    sketch.ellipse(265, 210, 10, 10);

    // draw the nose
    sketch.fill(255, 153, 153);
    sketch.stroke(0);
    sketch.ellipse(250, 220, 20, 15);

    // draw the mouth
    sketch.noFill(); // don't fill in the shape
    sketch.stroke(0); // set the stroke color to black
    sketch.strokeWeight(4)
    sketch.arc(250, 225, 60, 60, radians(50), radians(140));
    sketch.strokeWeight(1)

    // draw the legs
    sketch.fill(255, 204, 153);
    sketch.stroke(0);
    sketch.rect(100, 290, 30, 60);
    sketch.rect(230, 290, 30, 60);

    // draw the tail
    sketch.push()
    sketch.translate(-130, 80)
    sketch.rotate(radians(-30))
    sketch.fill(255, 204, 153);
    sketch.stroke(0);
    sketch.ellipse(100, 240, 20, 60);
    sketch.pop()
    sketch.pop();
}