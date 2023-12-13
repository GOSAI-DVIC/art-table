let junctions = [
    // Lips.
    [
        61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291
    ],
    [
        61, 185, 40, 39, 37, 0, 267, 267, 269, 270, 409, 291
    ],
    [
        78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308,
    ],
    [
        78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308
    ],
    // Left eye.
    [
        33, 7, 163, 144, 145, 153, 154, 155, 133,
    ],
    [
        33, 246, 161, 160, 159, 158, 157, 173, 133
    ],
    // Left eyebrow.
    [
        46, 53, 52, 65, 55,
    ],
    [
        70, 63, 105, 66, 107
    ],
    // Right eye.
    [
        263, 249, 390, 373, 374, 380, 381, 382, 362
    ],
    [
        263, 466, 388, 387, 386, 385, 384, 398, 362
    ],
    // Right eyebrow.
    [
        276, 283, 282, 295, 285,
    ],
    [
        300, 293, 334, 296, 336
    ],
    // Face oval.
    [
        10, 338, 297, 332, 284, 251, 389, 356,
        454, 323, 361, 288, 397, 365, 379, 378,
        400, 377, 152, 148, 176,  149, 150, 136, 172, 58, 132, 93, 234, 127, 162,
        21, 54, 103, 67, 109, 10
    ]
];

export function display_face(sketch, face_pose, show_face_points=true, show_face_lines=true) {
    if (face_pose == undefined) return;
    sketch.push();

    if (show_face_points) {
        for (let i = 0; i < face_pose.length; i++) {
            sketch.ellipse(
                face_pose[i][0] * sketch.width,
                face_pose[i][1] * sketch.height,
                max(-100*face_pose[i][2], 0)
            );
        }
    }

    sketch.stroke(255);
    if (
        show_face_lines
    ) {
        junctions.forEach(parts => {
            parts.forEach((pair, i) => {
                if (i < parts.length - 1) {
                    let meanZ = (face_pose[parts[i]][2] + face_pose[parts[i+1]][2]) / 2;
                    sketch.strokeWeight(max(2.0-100*meanZ, 0));
                    sketch.line(
                        face_pose[parts[i]][0] * sketch.width,
                        face_pose[parts[i]][1] * sketch.height,
                        face_pose[parts[i+1]][0] * sketch.width,
                        face_pose[parts[i+1]][1] * sketch.height
                    );
                }
            })
        })
    }

    sketch.pop();
}
