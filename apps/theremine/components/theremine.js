export class Theremine {
    constructor() {
        this.frequency = 0;
        this.amplitude = 0;

        loadJSON("./platform/home/common/theremine_parameters.json", (data) => {
            this.frequency_min = data.frequency_min[1];
            this.frequency_max = data.frequency_max[1];
            this.frequency_start = data.frequency_start;
            this.frequency_end = data.frequency_end;

            this.amplitude_min = data.amplitude_min;
            this.amplitude_max = data.amplitude_max;
            this.amplitude_start = data.amplitude_start;
            this.amplitude_end = data.amplitude_end;

            this.ready = true;
        });

        this.ready = false;
    }

    update_parameters(hands_position, hands_handedness, hands_sign) {
        if (!this.ready) return;
        if (hands_position == undefined || hands_position.length != 2) return 0;
        if (hands_position[0] == undefined || hands_position[1] == undefined)
            return 0;
        if (hands_position[0].length != 21 || hands_position[1].length != 21)
            return 0;

        let left_hand, right_hand;
        if (hands_handedness[0][1] == "Left" && hands_handedness[1][1] == "Right") {
            left_hand = hands_position[0];
            right_hand = hands_position[1];
        } else if (
            hands_handedness[0][1] == "Right" &&
            hands_handedness[1][1] == "Left"
        ) {
            left_hand = hands_position[1];
            right_hand = hands_position[0];
        } else {
            return 0;
        }

        this.amplitude = lerp(
            this.amplitude,
            map(
                max(left_hand[12][1], left_hand[16][1]),
                this.amplitude_start,
                this.amplitude_end,
                this.amplitude_max,
                this.amplitude_min
            ),
            0.5
        );

        this.amplitude = constrain(
            this.amplitude,
            this.amplitude_min,
            this.amplitude_max
        );

        // Frequency evolves in a logarithmic scale

        let x_min = this.log2(this.frequency_min);
        let x_max = this.log2(this.frequency_max);

        let x = map(
            // max(right_hand[10][0], right_hand[14][0]),
            right_hand[10][0],
            this.frequency_start,
            this.frequency_end,
            x_min,
            x_max
        );

        this.frequency = lerp(this.frequency, Math.pow(2, x), 0.3);

        this.frequency = constrain(
            this.frequency,
            this.frequency_min,
            this.frequency_max
        );
    }

    log2(x) {
        return Math.log(x) / Math.log(2);
    }

    is_valid() {
        return (
            this.frequency <= this.frequency_max &&
            this.frequency >= this.frequency_min &&
            this.amplitude <= this.amplitude_max &&
            this.amplitude >= this.amplitude_min
        );
    }

    toJSON() {
        return {
            frequency: this.frequency,
            amplitude: this.amplitude,
        };
    }
}
