import { Slider } from './slider.js';

export class ColorPicker {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        let dw = this.w / 7;

        this.hueSlider = new Slider(x-3*dw, y, dw, h, "H", "white", 0);
        this.saturationSlider = new Slider(x-dw, y, dw, h, "S", "white", 0);
        this.luminositySlider = new Slider(x+dw, y, dw, h, "L", "white", 0);
        this.sizeSlider = new Slider(x+3*dw, y, dw, h, "Size", "white", 0);


        let colorPickerStep = h/20;
        this.hueSlider.displayBackground = (sketch) => {
            sketch.push();
            sketch.strokeWeight(colorPickerStep);
            for (let y = 0; y <= this.hueSlider.h; y+=colorPickerStep) {
                let col = this.hueSlider.enabled ? `hsl(${Math.floor(360 - 360 * y / this.hueSlider.h)}, 100%, 50%)` : "gray";
                sketch.stroke(col);
                sketch.line(-this.hueSlider.w/2, y - this.hueSlider.h/2, this.hueSlider.w/2, y - this.hueSlider.h/2);
            }
            let y = 0
            sketch.pop();
        }

        this.hueSlider.cursorColor = `hsl(0, 100%, 50%)`;
        this.hueSlider.hueValue = 0;
        this.hueSlider.setOnChange(() => {
            this.hueSlider.hueValue = Math.floor(360 * this.hueSlider.progress);
            this.hueSlider.cursorColor = `hsl(${this.hueSlider.hueValue}, 100%, 50%)`;
            this.saturationSlider.cursorColor = `hsl(${Math.floor(360 * this.hueSlider.progress)}, ${this.saturationSlider.saturationValue}%, 50%)`;
            this.luminositySlider.cursorColor = `hsl(${Math.floor(360 * this.hueSlider.progress)}, ${this.saturationSlider.saturationValue}%, ${this.luminositySlider.luminosityValue}%)`;
            this.sizeSlider.cursorColor = `hsl(${Math.floor(360 * this.hueSlider.progress)}, ${this.saturationSlider.saturationValue}%, ${this.luminositySlider.luminosityValue}%)`;
        })

        this.saturationSlider.displayBackground = (sketch) => {
            sketch.push();
            sketch.strokeWeight(colorPickerStep);
            for (let y = 0; y <= this.saturationSlider.h; y+=colorPickerStep) {
                let col = this.saturationSlider.enabled ? `hsl(${this.hueSlider.hueValue}, ${Math.floor(100 - 100 * y / this.saturationSlider.h)}%, 50%)` : "gray";
                sketch.stroke(col);
                sketch.line(-this.saturationSlider.w/2, y - this.saturationSlider.h/2, this.saturationSlider.w/2, y - this.saturationSlider.h/2);
            }
            let y = 0
            sketch.pop();
        }

        this.saturationSlider.progress = 1;
        this.saturationSlider.cursorColor = `hsl(0, 100%, 50%)`;
        this.saturationSlider.saturationValue = 100;
        this.saturationSlider.setOnChange(() => {
            this.saturationSlider.saturationValue = Math.floor(100 * this.saturationSlider.progress);
            this.saturationSlider.cursorColor = `hsl(${this.hueSlider.hueValue}, ${this.saturationSlider.saturationValue}%, 50%)`;
            this.luminositySlider.cursorColor = `hsl(${this.hueSlider.hueValue}, ${this.saturationSlider.saturationValue}%, ${this.luminositySlider.luminosityValue}%)`;
            this.sizeSlider.cursorColor = `hsl(${this.hueSlider.hueValue}, ${this.saturationSlider.saturationValue}%, ${this.luminositySlider.luminosityValue}%)`;
        })


        this.luminositySlider.displayBackground = (sketch) => {
            sketch.push();
            sketch.strokeWeight(colorPickerStep);
            for (let y = 0; y <= this.luminositySlider.h; y+=colorPickerStep) {
                let col = this.luminositySlider.enabled ? `hsl(${this.hueSlider.hueValue}, ${this.saturationSlider.saturationValue}%, ${Math.floor(100 - 100 * y / this.luminositySlider.h)}%)` : "gray";
                sketch.stroke(col);
                sketch.line(-this.luminositySlider.w/2, y - this.luminositySlider.h/2, this.luminositySlider.w/2, y - this.luminositySlider.h/2);
            }
            let y = 0
            sketch.pop();
        }

        this.luminositySlider.progress = 0.5;
        this.luminositySlider.cursorColor = `hsl(0, 100%, 50%)`;
        this.luminositySlider.luminosityValue = 50;
        this.luminositySlider.setOnChange(() => {
            this.luminositySlider.luminosityValue = Math.floor(100 * this.luminositySlider.progress);
            this.luminositySlider.cursorColor = `hsl(${this.hueSlider.hueValue}, ${this.saturationSlider.saturationValue}%, ${this.luminositySlider.luminosityValue}%)`;
            this.sizeSlider.cursorColor = `hsl(${this.hueSlider.hueValue}, ${this.saturationSlider.saturationValue}%, ${this.luminositySlider.luminosityValue}%)`;
        })


        let radiusMin = 10;
        let radiusMax = 50;
        this.sizeSlider.displayEdge = (sketch) => {
            sketch.push();

            sketch.fill(this.sizeSlider.enabled ? this.sizeSlider.cursorColor: "gray");
            sketch.strokeWeight(this.sizeSlider.selected ? 10 : 2);


            sketch.noStroke();
            sketch.beginShape();
            sketch.vertex(-radiusMax, -this.sizeSlider.h/2 + radiusMax);
            sketch.vertex(radiusMax, -this.sizeSlider.h/2 + radiusMax);
            sketch.vertex(radiusMin, this.sizeSlider.h/2 - radiusMin);
            sketch.vertex(-radiusMin, this.sizeSlider.h/2 - radiusMin);
            sketch.endShape(sketch.CLOSE);


            sketch.stroke(this.sizeSlider.enabled ? 255: "gray");
            sketch.line(-radiusMax, -this.sizeSlider.h/2 + radiusMax, -radiusMin, this.sizeSlider.h/2 - radiusMin);
            sketch.line(radiusMax, -this.sizeSlider.h/2 + radiusMax, radiusMin, this.sizeSlider.h/2 - radiusMin);
            sketch.arc(0, -this.sizeSlider.h/2 + radiusMax, radiusMax*2, radiusMax*2, sketch.PI, 0);
            sketch.arc(0, this.sizeSlider.h/2 - radiusMin, radiusMin*2, radiusMin*2, 0, sketch.PI);

            sketch.pop();
        }

        this.sizeSlider.cursorColor = `hsl(0, 100%, 50%)`;
        this.sizeSlider.sizeValue = 2.0*radiusMin;
        this.sizeSlider.displayCursor = (sketch) => {
            sketch.push();

            sketch.noFill();
            sketch.stroke(this.sizeSlider.enabled ? 255: "gray");
            sketch.strokeWeight(this.sizeSlider.selected ? 10 : 4);

            sketch.ellipse(0, this.sizeSlider.h / 2 - radiusMin - (this.sizeSlider.h - radiusMax - radiusMin) * this.sizeSlider.progress, 2.0*(radiusMin + this.sizeSlider.progress * (radiusMax - radiusMin)) );

            sketch.pop();
        }

        this.sizeSlider.setOnChange(() => {
            this.sizeSlider.sizeValue = 2.0*(radiusMin + this.sizeSlider.progress * (radiusMax - radiusMin));
        });
    }

    enable() {
        this.hueSlider.enabled = true;
        this.saturationSlider.enabled = true;
        this.luminositySlider.enabled = true;
        this.sizeSlider.enabled = true;
    }

    disable() {
        this.hueSlider.enabled = false;
        this.saturationSlider.enabled = false;
        this.luminositySlider.enabled = false;
        this.sizeSlider.enabled = false;
    }

    update(pointer) {
        this.hueSlider.update(pointer);
        this.saturationSlider.update(pointer);
        this.luminositySlider.update(pointer);
        this.sizeSlider.update(pointer);
    }

    display(sketch) {
        this.hueSlider.display(sketch);
        this.saturationSlider.display(sketch);
        this.luminositySlider.display(sketch);
        this.sizeSlider.display(sketch);
    }
}
