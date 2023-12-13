


export class Toggle {
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

        this.focused = false;
        this.active = false;
        this.enabled = false;
    }

    setOnClick(onClick) {
        this.onClick = onClick;
    }

    update(pointer) {
        if (!this.enabled) return;
        this.focused = false;
        if (this.isHovered(pointer)) {
            pointer.hovering = true;
            if (pointer.clicked) {
                pointer.clicked = false;
                this.active = !this.active;
                this.onClick();
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
        sketch.push();

        sketch.translate(this.x, this.y);

        if (!this.active) {
            sketch.stroke(this.enabled ? this.color : "gray");
            sketch.strokeWeight(this.focused ? 10 : 2);
            sketch.noFill();
        } else {
            sketch.stroke("black");
            sketch.strokeWeight(this.focused ? 20 : 2);
            sketch.fill(this.color);
        }

        sketch.rectMode(sketch.CENTER);
        sketch.rect(0, 0, this.w, this.h, this.h / 3);

        let reducing = 0.7;
        sketch.noStroke();
        if (this.active) {
            sketch.fill("black");
            sketch.circle(this.w/2 - this.h/2, 0, this.h*reducing);
        } else {
            sketch.fill(this.enabled ? this.color : "gray");
            sketch.circle(this.h/2-this.w/2, 0, this.h*reducing);
        }

        let textOffset = this.active ? -this.h/3 : this.h/3;
        sketch.textAlign(sketch.CENTER, sketch.CENTER);
        sketch.textSize(this.h / 2);
        sketch.text(this.text, textOffset, 0);

        sketch.pop();
    }

}
