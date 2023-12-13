let junctions = [
    // Lips.
    []
];

export function display_face(sketch, face_pose, show_face_points=true, show_face_lines=true) {
    if (face_pose == undefined) return;
    sketch.push();
    sketch.stroke(255, 0, 0);
    sketch.strokeWeight(4);
    if (show_face_points) {
        for (let i = 0; i < face_pose.length; i++) {
            sketch.ellipse(
                face_pose[i][0] * sketch.width,
                face_pose[i][1] * sketch.height,
                10.0
            );
        }
    }

    sketch.pop();
}
