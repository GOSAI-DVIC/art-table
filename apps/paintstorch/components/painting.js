export const paintingArea = new p5((sketch) => {
    sketch.erasing = false;
    sketch.activated = false;

    sketch.setup = () => {
        sketch.selfCanvas = sketch.createCanvas(0, 0).position(0, 0).style("z-index", 1);
        sketch.selfCanvas.hide();
    }

    sketch.set = (corners) => {
        let min_x = Math.min(...corners.map((corner) => corner[0]));
        let max_x = Math.max(...corners.map((corner) => corner[0]));
        let min_y = Math.min(...corners.map((corner) => corner[1]));
        let max_y = Math.max(...corners.map((corner) => corner[1]));

        sketch.hitbox = {
            x: min_x,
            y: min_y,
            w: max_x - min_x,
            h: max_y - min_y,
        };

        let width = max_x - min_x;
        let height = max_y - min_y;

        let left = min_x;
        let top = min_y;

        sketch.selfCanvas = sketch.createCanvas(width, height).position(left, top).style("z-index", 1);

        sketch.coords = [
            [min_x, min_y],
            [max_x, min_y],
            [max_x, max_y],
            [min_x, max_y],
        ]

        sketch.drawingContext.restore();
        sketch.noFill();
        sketch.stroke("white");
        sketch.beginShape();
        sketch.vertex(corners[0][0] - min_x, corners[0][1] - min_y);
        sketch.vertex(corners[1][0] - min_x, corners[1][1] - min_y);
        sketch.vertex(corners[2][0] - min_x, corners[2][1] - min_y);
        sketch.vertex(corners[3][0] - min_x, corners[3][1] - min_y);
        sketch.endShape(sketch.CLOSE);
        sketch.drawingContext.clip();

        sketch.erasing = false;
        sketch.activated = true;

        sketch.selfCanvas.show();
    }

    sketch.scribe = (pointer) => {
        sketch.noErase();
        sketch.stroke(pointer.pointerColor);
        sketch.strokeWeight(pointer.pointerSize);
        sketch.lineCap = "round";

        if(sketch.erasing) sketch.erase();
        sketch.line(pointer.previousX - sketch.hitbox.x, pointer.previousY - sketch.hitbox.y,
                    pointer.x - sketch.hitbox.x, pointer.y - sketch.hitbox.y);

    }

    sketch.update = (pointer, erasing) => {
        sketch.erasing = erasing;
        if ((pointer.drawing || erasing) && sketch.isHovered(pointer) && pointer.pointerDown) {
            sketch.scribe(pointer);
        }
    }

    sketch.isHovered = (pointer) => {
        return (
            pointer.x > sketch.hitbox.x &&
            pointer.x < sketch.hitbox.x + sketch.hitbox.w &&
            pointer.y > sketch.hitbox.y &&
            pointer.y < sketch.hitbox.y + sketch.hitbox.h
        )
    }

    sketch.getImg = () => {
        return sketch.selfCanvas.elt.toDataURL("image/png");
    }
});
