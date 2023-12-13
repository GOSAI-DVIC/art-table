

export class Slider {
    constructor(x, y, w, h, text, color, angle) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.hitboxOffset = 0.2;
        let dw = this.w * this.hitboxOffset;
        let dh = this.h * this.hitboxOffset;

        this.hitbox = {
            x: this.x,
            y: this.y,
            w: this.w + dw,
            h: this.h + dh
        };

        this.text = text;
        this.color = color;
        this.angle = angle;
        this.onChange;

        this.selected = false;

        this.progessUpperBound = 1.0;
        this.progressLowerBound = 0.0;
        this.progress = this.progressLowerBound;

        this.cursorColor = "black"

        this.enabled = false;
    }

    setOnChange(onChange) {
        this.onChange = onChange;
    }

    moveSlider(pointer) {
        let dy = (this.y + this.h / 2 - pointer.y) / this.h;
        dy = Math.min(dy, this.progessUpperBound);
        dy = Math.max(dy, this.progressLowerBound);
        this.progress = dy;
        if (this.onChange) this.onChange(this.progress);
    }

    update(pointer) {
        if (!this.enabled) return;

        this.focused = false;
        if (this.isHovered(pointer)) {
            pointer.hovering = true;
            if (pointer.pressed) {
                this.selected = true;
            }
        }

        if (!pointer.pointerDown) {
            this.selected = false;
        }

        if (this.selected) {
            this.moveSlider(pointer);
        }
    }

    isHovered(pointer) {
        return pointer.x > this.hitbox.x - this.hitbox.w / 2 &&
            pointer.x < this.hitbox.x + this.hitbox.w / 2 &&
            pointer.y > this.hitbox.y - this.hitbox.h / 2 &&
            pointer.y < this.hitbox.y + this.hitbox.h / 2;
    }
    display(sketch) {
        sketch.push();

        sketch.translate(this.x, this.y);

        this.displayText(sketch);
        sketch.drawingContext.save();
        this.displayEdge(sketch);
        sketch.drawingContext.clip();
        this.displayBackground(sketch);
        sketch.drawingContext.restore();

        this.displayCursor(sketch);


        sketch.pop();
    }

    displayText(sketch) {
        sketch.push();

        sketch.fill(this.color);
        sketch.noStroke();

        sketch.textAlign(sketch.CENTER, sketch.CENTER);
        sketch.textSize(this.w / 2);
        sketch.text(this.text, 0, this.h / 2 + this.w / 2);

        sketch.pop();
    }

    displayEdge(sketch) {
        sketch.push();

        sketch.noFill();
        sketch.stroke(this.enabled ? this.color : "gray");
        sketch.strokeWeight(this.selected ? 10 : 2);

        sketch.rectMode(sketch.CENTER);
        sketch.rect(0, 0, this.w, this.h, this.w / 3);
        sketch.pop();
    }

    displayBackground(sketch) {}

    displayCursor(sketch) {
        sketch.push();

        sketch.fill(this.enabled ? this.cursorColor : "gray");
        sketch.stroke(this.enabled ? this.color : "gray");
        sketch.strokeWeight(this.selected ? 10 : 2);

        sketch.rectMode(sketch.CENTER);
        let cursorHeight = 30;
        sketch.rect(0, this.h / 2 - cursorHeight/2 - (this.h - cursorHeight) * this.progress, this.hitbox.w, cursorHeight, this.w / 8   );

        sketch.pop();
    }
}
