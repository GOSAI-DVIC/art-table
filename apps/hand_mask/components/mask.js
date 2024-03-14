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

export function display_mask(sketch, hand_pose) {
    if (hand_pose == undefined) return;
    if (hand_pose.length != 21) return;
    sketch.push();

    sketch.stroke(0);
    sketch.fill(0);
    sketch.strokeWeight(max(
        sketch.dist(hand_pose[10][0], hand_pose[10][1], hand_pose[9][0], hand_pose[9][1]),
        1.5*sketch.dist(hand_pose[3][0], hand_pose[3][1], hand_pose[4][0], hand_pose[4][1]))
    );
    hand_junctions.forEach(parts => {
        parts.forEach(pair => {
            sketch.line(
                hand_pose[pair[0]][0],
                hand_pose[pair[0]][1],
                hand_pose[pair[1]][0],
                hand_pose[pair[1]][1]
            );
        })
    })
    sketch.pop();
}
