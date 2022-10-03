export class Page {
    constructor(sketch) {
        loadJSON(
            "./platform/home/common/notes.json",
            (data) => {
                this.NOTES = data;

                loadJSON("./platform/home/common/theremine_parameters.json", (data) => {
                    this.frequency_min = data.frequency_min[1];
                    this.frequency_max = data.frequency_max[1];
                    this.x_min = this.log2(this.frequency_min);
                    this.x_max = this.log2(this.frequency_max);
                    this.frequency_start = data.frequency_start;
                    this.frequency_end = data.frequency_end;


                    sketch.push();
                    for (let note of Object.keys(this.NOTES)) {
                        if(note.length > 2) continue;
                        let frequency = this.NOTES[note];
                        if (frequency < this.frequency_min) continue;
                        if (frequency > this.frequency_max) continue;

                        let x = map(
                            this.log2(frequency),
                            this.x_min,
                            this.x_max,
                            this.frequency_start*sketch.width,
                            this.frequency_end*sketch.width
                        );
                        let y = 0.5*sketch.height;
                        sketch.stroke(255);
                        sketch.strokeWeight(1);
                        sketch.line(x, y, x, sketch.height);
                    }
                    sketch.pop();
                });

            }
        );

        this.ready = false;
    }

    show(sketch) {
    }

    log2(x) {
        return Math.log(x) / Math.log(2);
    }
}
