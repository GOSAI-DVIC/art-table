


export class Button {
    constructor(x, y, w, h, text, color) {
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
            h: this.h + dh,
        };

        this.text = text;
        this.color = color;
        this.onClick = () => {};

        this.selected = false;
        this.focused = false;
        this.enabled = false;
        this.visible = true;
    }

    setOnClick(onClick) {
        this.onClick = onClick;
    }

    update(pointer) {
        if (!this.enabled) return;
        if (!this.visible) return;
        this.focused = false;
        if (this.isHovered(pointer)) {
            pointer.hovering = true;
            if (pointer.clicked) {
                pointer.clicked = false;
                this.onClick();
                this.selected = true;

                setTimeout(() => {
                    this.selected = false;
                }, 300);
            } else if (pointer.pointerDown) {
                this.focused = true;
            }
        }
    }

    isHovered(pointer) {
        return pointer.x > this.hitbox.x - this.hitbox.w / 2 &&
            pointer.x < this.hitbox.x + this.hitbox.w / 2 &&
            pointer.y > this.hitbox.y - this.hitbox.h / 2 &&
            pointer.y < this.hitbox.y + this.hitbox.h / 2;
    }

    display(sketch) {
        if (!this.visible) return;
        sketch.push();

        sketch.translate(this.x, this.y);

        if (!this.selected) {
            sketch.stroke(this.enabled ? this.color : "gray");
            sketch.strokeWeight(this.focused ? 10 : 2);
            sketch.noFill();
        } else {
            sketch.noStroke();
            sketch.fill(this.color);
        }

        sketch.rectMode(sketch.CENTER);
        sketch.rect(0, 0, this.w, this.h, this.h / 3);

        sketch.noStroke();
        if (this.selected) {
            sketch.fill("black");
        } else {
            sketch.fill(this.enabled ? this.color : "gray");
        }

        sketch.textAlign(sketch.CENTER, sketch.CENTER);
        sketch.textSize(this.h / 2);
        sketch.text(this.text, 0, 0);

        sketch.pop();
    }

}
