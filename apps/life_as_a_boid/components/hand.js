

export function computeCentroidAndRadius(hand) {
    // console.log(hand[0]);
    let centroid = createVector(0, 0);
    let radius = 0;

    for (let i = 0; i < hand.length; i++) {
        let x = hand[i][0];
        let y = hand[i][1];

        centroid.add(createVector(x, y));
    }

    centroid.div(hand.length);

    for (let i = 0; i < hand.length; i++) {
        let x = hand[i][0];
        let y = hand[i][1];

        let dist = p5.Vector.dist(centroid, createVector(x, y));
        if (dist > radius) {
            radius = dist;
        }
    }
    radius *= 1.5;

    return [centroid, radius];
}
