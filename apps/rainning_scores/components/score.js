export class Score {
    constructor() {
        this.score_name = "la_vie_en_rose";
        // this.score_name = "in_the_moonlight";

        loadJSON(
            "./platform/home/apps/rainning_scores/components/notes.json",
            (data) => {
                this.NOTES = data;

                loadJSON("./platform/home/common/theremine_parameters.json", (data) => {
                    this.frequency_min = data.frequency_min[1];
                    this.frequency_max = data.frequency_max[1];
                    this.x_min = this.log2(this.frequency_min);
                    this.x_max = this.log2(this.frequency_max);
                    this.frequency_start = data.frequency_start;
                    this.frequency_end = data.frequency_end;

                    this.amplitude_min = data.amplitude_min;
                    this.amplitude_max = data.amplitude_max;
                    this.amplitude_start = data.amplitude_start;
                    this.amplitude_end = data.amplitude_end;

                    loadJSON(
                        "./platform/home/apps/rainning_scores/components/scores/" +
                        this.score_name +
                        ".json",
                        (data) => {
                            this.score = data["score"];
                            this.ready = true;
                        }
                    );
                });
            }
        );

        this.ready = false;
        this.counter = 0;
        this.speed = 4;
        this.unit_length = 400;
        this.note_width = 10;
    }

    update() {
        if (!this.ready) return;

        this.counter += this.speed;
    }

    show(sketch) {
        if (!this.ready) return;

        sketch.push();
        this.accumulation = 0;
        for (let i = 0; i < this.score.length; i++) {
            let note = this.score[i];
            let frequency = this.NOTES[note[0]];
            let length = note[1] * this.unit_length;
            let x = map(
                this.log2(frequency),
                this.x_min,
                this.x_max,
                this.frequency_start * sketch.width,
                this.frequency_end * sketch.width
            );
            let y = this.counter - this.accumulation - length;
            this.accumulation += length;
            sketch.fill(255);
            sketch.rect(x-this.note_width/2, y, this.note_width, length);
        }
        sketch.pop();
    }

    log2(x) {
        return Math.log(x) / Math.log(2);
    }
}

// "score": [
    //     ["C5", 3],
    //     ["B4", 1],
    //     ["A4", 1],
    //     ["G4", 1],
    //     ["E4", 1],
    //     ["C5", 1],
    //     ["B4", 3],
    //     ["A4", 1],
    //     ["G4", 1],
    //     ["E4", 1],
    //     ["C4", 1],
    //     ["B4", 1],
    //     ["A4", 3],
    //     ["G4", 1],
    //     ["E4", 1],
    //     ["B3", 1],
    //     ["C4", 1],
    //     ["B4", 1],
    //     ["A4", 3],
    //     ["G4", 2]
    // ]
