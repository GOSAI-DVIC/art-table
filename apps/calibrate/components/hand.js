let hand_junctions = [
    [
        [0, 1],
        [0, 5],
        [0, 9],
        [0, 13],
        [0, 17],
        [5, 9],
        [9, 13],
        [13, 17],
    ],
    [
        [1, 2],
        [2, 3],
        [3, 4]
    ],
    [
        [5, 6],
        [6, 7],
        [7, 8]
    ],
    [
        [9, 10],
        [10, 11],
        [11, 12]
    ],
    [
        [13, 14],
        [14, 15],
        [15, 16]
    ],
    [
        [17, 18],
        [18, 19],
        [19, 20]
    ]
]

export function display_hand(sketch, hand_pose, handedness, sign, show_hands_points, show_hands_lines, frameSize) {
    if (hand_pose == undefined) return;
    if (hand_pose.length != 21) return;

    sketch.push();

    sketch.fill(200, 200, 0, 20);
    sketch.strokeWeight(2);
    sketch.noStroke();
    // console.log(hand_pose);
    if (show_hands_points) {
        for (let i = 0; i < hand_pose.length; i++) {
            sketch.ellipse(
                hand_pose[i][0] * frameSize[0],
                hand_pose[i][1] * frameSize[1],
                10
            );
        }
    }

    sketch.stroke(255, 0, 0, 20);
    sketch.strokeWeight(2);
    if (
        show_hands_lines &&
        hand_pose.length == 21
    ) {
        hand_junctions.forEach(parts => {
            parts.forEach(pair => {
                sketch.line(
                    hand_pose[pair[0]][0] * frameSize[0],
                    hand_pose[pair[0]][1] * frameSize[1],
                    hand_pose[pair[1]][0] * frameSize[0],
                    hand_pose[pair[1]][1] * frameSize[1]
                );
            })
        })
    }
    // console.log(handedness);
    sketch.fill(255, 0, 0, 20);
    sketch.noStroke();
    if (
        handedness != undefined && handedness.length > 0
    ) {
        sketch.textSize(32);
        sketch.text(handedness[1], hand_pose[0][0] * frameSize[0], 40 + hand_pose[0][1] * frameSize[1]);
        sketch.textSize(16);
        sketch.text(handedness[2], hand_pose[0][0] * frameSize[0], 65 + hand_pose[0][1] * frameSize[1]);
    }

    if (
        sign != undefined && sign.length > 0
    ) {
        sketch.textSize(32);
        sketch.text(sign[0], hand_pose[0][0] * frameSize[0], 120 + hand_pose[0][1] * frameSize[1]);
        sketch.textSize(16);
        sketch.text(sign[1], hand_pose[0][0] * frameSize[0], 145 + hand_pose[0][1] * frameSize[1]);
    }

    sketch.pop();
}
