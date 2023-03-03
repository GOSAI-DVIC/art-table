let goDefaultNextStep = false;
let firstRun = true;
let energyBar = 0;

export function sleepingShow(sketch) {
    firstRun ? onEnter() : null

    energyBarFilling(sketch)
    showSleepingDog(sketch)
    energyBar += 0.2;

    if (energyBar > 100) {
        goDefaultNextStep = true;
    }

    if (goDefaultNextStep == true) {
        onExit()
        return "awake"
    }
    return "sleeping"
}

function onEnter() {
    firstRun = false;
    energyBar = 0;
}

function onExit() {
    firstRun = true;
    goDefaultNextStep = false;

}

export function sleepingReset() {
    onExit()
}

function showSleepingDog(sketch) {
    sketch.push();
    sketch.translate(-200, -height / 2 + 50);
    // draw the body
    sketch.fill(255, 204, 153);
    sketch.stroke(0);
    sketch.ellipse(175, 275, 200, 80);

    // draw the head
    sketch.fill(255, 204, 153);
    sketch.stroke(0);
    sketch.ellipse(250, 220, 100, 100);

    // draw the ears
    sketch.fill(100, 50, 0);
    sketch.stroke(0);
    sketch.triangle(270, 170, 300, 180, 290, 210);
    sketch.triangle(230, 170, 200, 180, 210, 210);

    // draw the eyes
    sketch.fill(0);
    sketch.stroke(0);
    sketch.ellipse(235, 210, 20, 20);
    sketch.ellipse(265, 210, 20, 20);

    // draw the nose
    sketch.fill(255, 153, 153);
    sketch.stroke(0);
    sketch.ellipse(250, 220, 20, 15);

    sketch.noFill(); // don't fill in the shape
    sketch.stroke(0); // set the stroke color to black
    sketch.strokeWeight(4)
    sketch.arc(250, 225, 60, 60, radians(50), radians(140));
    sketch.strokeWeight(1)

    // draw the legs
    sketch.fill(255, 204, 153);
    sketch.stroke(0);
    sketch.push()
    sketch.translate(125, 290)
    sketch.rotate(radians(90))
    sketch.rect(0, 0, 30, 60);
    sketch.pop()

    sketch.push()
    sketch.translate(290, 290)
    sketch.rotate(radians(90))
    sketch.rect(0, 0, 30, 60);
    sketch.pop()

    // draw the tail
    sketch.push()
    sketch.translate(70, 270)
    sketch.rotate(radians(60))
    sketch.fill(255, 204, 153);
    sketch.stroke(0);
    sketch.ellipse(0, 0, 20, 60);
    sketch.pop()

    sketch.pop()
}

function energyBarFilling(sketch) {
    sketch.push()
    sketch.translate(0, -height / 2 + 150);
    sketch.rectMode(sketch.CENTER);
    sketch.noFill();
    sketch.stroke(255)
    sketch.rect(0, 0, 100, 10);
    sketch.fill(0, 255, 0);
    sketch.noStroke();
    sketch.rect(0, 0, energyBar, 10);
    sketch.pop()
}