// Marble : ECS based : {x, y, vx, vy, ax, ay, r, color}
// Hand : List of points : [[x, y], [x, y], ...]

let hand_junctions = [
    [0, 1],
    [0, 5],
    [0, 9],
    [0, 13],
    [0, 17],
    [5, 9],
    [9, 13],
    [13, 17],
    [1, 2],
    [2, 3],
    [3, 4],
    [5, 6],
    [6, 7],
    [7, 8],
    [9, 10],
    [10, 11],
    [11, 12],
    [13, 14],
    [14, 15],
    [15, 16],
    [17, 18],
    [18, 19],
    [19, 20]
]

export function show_marbles(marbles, sketch) {
    for (let i = 0; i < marbles.length; i++) {
        let marble = marbles[i];
        sketch.fill(marble.color);
        sketch.noStroke();
        sketch.ellipse(marble.x, marble.y, 2 * marble.r);
    }
}

// move_marble: Make marbles move to avoid collision with other marbles and walls and hand
export function move_marble_from_hand(marble, hand, sketch) {
    let x = marble.x;
    let y = marble.y;
    let vx = marble.vx;
    let vy = marble.vy;
    let ax = marble.ax;
    let ay = marble.ay;
    let r = marble.r;
    let color = marble.color;

    hand_junctions.forEach((junction) => {
        let p = { x : x, y : y };
        let v = { x : hand[junction[0]][0] * sketch.width, y : hand[junction[0]][1] * sketch.height };
        let w = { x : hand[junction[1]][0] * sketch.width, y : hand[junction[1]][1] * sketch.height};
        let [dist, closest_point] = distToSegment(p, v, w);
        if (dist < 2*r) {
            // console.log(dist);
            let dx = x - closest_point.x;
            let dy = y - closest_point.y;
            x = closest_point.x + 2*r * dx / dist;
            y = closest_point.y + 2*r * dy / dist;
            // sketch.line(x, y, closest_point.x, closest_point.y);
        }
    })

    return {
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        ax: ax,
        ay: ay,
        r: r,
        color: color
    };
}

export function move_marble_from_marbles(marbles, marble, idx, sketch) {
    let x = marble.x;
    let y = marble.y;
    let vx = marble.vx;
    let vy = marble.vy;
    let ax = marble.ax;
    let ay = marble.ay;
    let r = marble.r;
    let color = marble.color;

    for (let i = 0; i < marbles.length; i++) {
        if (i != idx) {
            let dx = x - marbles[i].x;
            let dy = y - marbles[i].y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < (r + marbles[i].r) * 0.99) {
                let angle = Math.atan2(dy, dx);
                let ratio = r / (r + marbles[i].r);
                let mid_x = x - ratio * dx;
                let mid_y = y - ratio * dy;
                x = mid_x + 1.1 * r * Math.cos(angle);
                y = mid_y + 1.1 * r * Math.sin(angle);
                marbles[i][0] = mid_x - 1.1 * marbles[0].r * Math.cos(angle);
                marbles[i][1] = mid_y - 1.1 * marbles[0].r * Math.sin(angle);
                // sketch.line(x, y, marbles[i].x, marbles[i].y);
            }
        }
    }

    return {
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        ax: ax,
        ay: ay,
        r: r,
        color: color
    };
}

export function move_marble_from_walls(marble, sketch) {
    let x = marble.x;
    let y = marble.y;
    let vx = marble.vx;
    let vy = marble.vy;
    let ax = marble.ax;
    let ay = marble.ay;
    let r = marble.r;
    let color = marble.color;

    x = Math.min(Math.max(x, r), sketch.width - r);
    y = Math.min(Math.max(y, r), sketch.height - r);

    return {
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        ax: ax,
        ay: ay,
        r: r,
        color: color
    };
}

function sqr(x) {
    return x * x
}

function dist2(v, w) {
    return sqr(v.x - w.x) + sqr(v.y - w.y)
}

function distToSegmentSquared(p, v, w) {
    var l2 = dist2(v, w);
    if (l2 == 0) return dist2(p, v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    let closest_point = {
        x: v.x + t * (w.x - v.x),
        y: v.y + t * (w.y - v.y)
    };
    return [dist2(p, closest_point), closest_point];
}

function distToSegment(p, v, w) {
    let [dist_sq, closest_point] = distToSegmentSquared(p, v, w);
    return [Math.sqrt(dist_sq), closest_point];
}
