import Delaunator from 'https://cdn.skypack.dev/delaunator@5.0.0';

export function generatePoints(amount, width, height) {
    // Generate random points within the rectangle
    let points = [];
    for (let i = 0; i < amount; i++) {
        let x = random(width);
        let y = random(height);
            // let x = width/2;
            // let y = height/2;
        points.push(x);
        points.push(y);
    }

    // Add the corners of the rectangle to the points list
    points.push(0);
    points.push(0);
    points.push(width);
    points.push(0);
    points.push(0);
    points.push(height);
    points.push(width);
    points.push(height);

    return points;
}

export function generateColors(points) {
    let amount = points.length / 2;
    let colors = [];
    for (let i = 0; i < amount; i++) {
        let a = 256/8 + (256/8)*Math.floor(random(7));
        colors.push(a);
    }
    return colors;
}

export function computeTriangles(points) {

    // Perform Delaunay triangulation
    const delaunay = new Delaunator(points);

    return delaunay.triangles;
}

export function generateDirections(points) {
    let directions = [];
    for (let i = 0; i < (points.length-4)/2; i++) {
        let direction = [random(-1, 1), random(-1, 1)];
        directions.push(direction);
    }
    for (let i = 0; i < 4; i++) {
        let direction = [0, 0];
        directions.push(direction);
    }
    return directions;
}

export function movePoints(points, directions, width, height) {
    let moved_points = [];
    for (let i = 0; i < points.length-8; i+=2) {
        let point = [points[i], points[i+1]];
        let direction = directions[i/2];
        let new_point_x = point[0] + direction[0];
        let new_point_y = point[1] + direction[1];
        if (new_point_x < 0) {
            new_point_x = 0;
            directions[i/2][0] = -direction[0];
        } else if (new_point_x > width) {
            new_point_x = width;
            directions[i/2][0] = -direction[0];
        }
        if (new_point_y < 0) {
            new_point_y = 0;
            directions[i/2][1] = -direction[1];
        } else if (new_point_y > height) {
            new_point_y = height;
            directions[i/2][1] = -direction[1];
        }
        moved_points.push(new_point_x, new_point_y);
    }
    moved_points = moved_points.concat(points.slice(points.length-8, points.length));
    return {"points": moved_points, "directions": directions};
}


export function shiftDirectionsRandomly(directions) {
    for (let i = 0; i < directions.length-4; i++) {
        let direction = directions[i];
        let angle = random(-PI / 16, PI / 16);
        let new_direction = [
            direction[0] * cos(angle) - direction[1] * sin(angle),
            direction[0] * sin(angle) + direction[1] * cos(angle)
        ];
        directions[i] = new_direction;
    }
    return directions;
}

export function shiftPointsAwayFromHand(points, hand, hand_handedness, width, height) {

    const shifting_factor = 0.5;
    const shifting_limit = 500;

    const side_margin = 0;


    const thumb_tip = hand[4];
    const thumb_tip_x = thumb_tip[0] * width;
    const thumb_tip_y = thumb_tip[1] * height;

    const thumb_mcp = hand[2];
    const thumb_mcp_x = thumb_mcp[0] * width;
    const thumb_mcp_y = thumb_mcp[1] * height;

    const index_finger_tip = hand[8];
    const index_finger_tip_x = index_finger_tip[0] * width;
    const index_finger_tip_y = index_finger_tip[1] * height;

    const hand_center_x = min(max((0.5*(thumb_tip_x + index_finger_tip_x)/width - side_margin)/(1 - 2*side_margin), 0), 1) * width;
    const hand_center_y = min(max((0.5*(thumb_tip_y + index_finger_tip_y)/height - side_margin)/(1 - 2*side_margin), 0), 1) * height;

    const distance_thumb_index = dist(thumb_tip_x, thumb_tip_y, index_finger_tip_x, index_finger_tip_y);
    const distance_thumb_mcp = dist(thumb_tip_x, thumb_tip_y, thumb_mcp_x, thumb_mcp_y);
    const normalized_distance = distance_thumb_index / distance_thumb_mcp;
    const threshold = 0.7;

    let is_right_hand = true
    if (hand_handedness != undefined && hand_handedness.length > 0) {
        is_right_hand = hand_handedness[1] == "Right";
    }

    for (let i = 0; i < points.length-8; i+=2) {
        let x = points[i];
        let y = points[i+1];

        let distance = dist(x, y, hand_center_x, hand_center_y);
        let angle = atan2(y - hand_center_y, x - hand_center_x);

        if (distance < shifting_limit) {
            // Move the point away from the hand
            if (!is_right_hand && normalized_distance < threshold) {
                // distance =  (shifting_limit - distance) * (normalized_distance - 1.0);
                distance =  (shifting_limit - distance) * (threshold - normalized_distance)/threshold;
                // distance = 0;
            } else if (is_right_hand && normalized_distance < threshold) {
                distance = -1*max(distance*(threshold - normalized_distance)/threshold, min(i/5, 200));
            } else {
                distance = 0
            }

        } else {
            distance = 0;
        }

        let new_x = x + distance * cos(angle);
        let new_y = y + distance * sin(angle);

        points[i] = new_x;
        points[i+1] = new_y;
    }

    return points;
}
