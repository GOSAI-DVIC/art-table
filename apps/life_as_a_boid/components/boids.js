// Import Three.js
import * as THREE from "https://unpkg.com/three@0.156.1/build/three.module.js";
import * as BufferGeometryUtils from "https://unpkg.com/three@0.156.1/examples/jsm/utils/BufferGeometryUtils.js";


console.log("three.js version:", THREE.REVISION);
let hand_outline = [
    0, 1, 2, 3, 4, 8, 12, 16, 20, 18, 17, 0
];

function sqr(x) {
    return x * x
}

function dist2(v, w) {
    return sqr(v.x - w.x) + sqr(v.y - w.y)
}
function distToSegment(p, v, w) {
    let [dist_sq, closest_point] = distToSegmentSquared(p, v, w);
    return [Math.sqrt(dist_sq), closest_point];
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

let separation = 0.02;
let alignment = 0.1;
let cohesion = 0.05;
let hand_avoidance = 0.5;
let edge_avoidance = 0.5;

class Boid {
    constructor(x, y, angle, color, scene) {
        this.pos = createVector(x, y);
        this.vel = createVector(cos(angle), sin(angle)).mult(5);
        this.acc = createVector(0, 0);
        this.color = color;

        this.viewRadius = random(100, 200);
        this.size = 30 - this.viewRadius / 10;

        this.sphereMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(255, 150 + 75*(100-this.viewRadius)/100, 0)
        });
        this.coneMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(255, 255, 255)
        });

        const sphereGeometry = new THREE.SphereGeometry(this.size, 32, 32);
        const coneGeometry = new THREE.ConeGeometry(this.size*1.5, this.size, 32);
        coneGeometry.translate(0, this.size*0.25, 0);
        // coneGeometry.rotateZ(PI/2);

        this.sphereMesh = new THREE.Mesh(sphereGeometry, this.sphereMaterial);
        this.coneMesh = new THREE.Mesh(coneGeometry, this.coneMaterial);

        this.mesh = new THREE.Group();
        this.mesh.add(this.sphereMesh);
        this.mesh.add(this.coneMesh);

        scene.add(this.mesh);
    }

    getCloserBoids(boids) {
        let closerBoids = [];
        let distances = [];
        for (let other of boids) {
            if (other == this) continue;

            let distance = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
            if (distance < this.viewRadius) {
                closerBoids.push(other);
                distances.push(distance);
            }
        }
        return [closerBoids, distances];
    }

    checkSeparation(boids, distances) {
        let newAcc = createVector(0, 0);
        for (let i = 0; i < boids.length; i++) {
            let other = boids[i];
            let distance = distances[i];

            let diff = p5.Vector.sub(this.pos, other.pos);
            // diff.div(distance);
            newAcc.add(diff);
        }

        newAcc.mult(separation);
        // stroke(255, 0, 0);
        // strokeWeight(1);
        // line(this.pos.x, this.pos.y, this.pos.x + newAcc.x * 10, this.pos.y + newAcc.y * 10);
        this.acc.add(newAcc);
    }

    checkAlignment(boids) {
        let newAcc = createVector(0, 0);
        for (let other of boids) {

            newAcc.add(other.vel);
        }


        newAcc.mult(alignment);
        // stroke(0, 255, 0);
        // strokeWeight(1);
        // line(this.pos.x, this.pos.y, this.pos.x + newAcc.x * 10, this.pos.y + newAcc.y * 10);
        this.acc.add(newAcc);
    }

    checkCohesion(boids) {
        let newAcc = createVector(0, 0);
        let center = createVector(0, 0);
        for (let other of boids) {
            center.add(other.pos);
        }

        center.div(boids.length);
        newAcc = p5.Vector.sub(center, this.pos);


        newAcc.mult(cohesion);
        // stroke(0, 0, 255);
        // strokeWeight(1);
        // line(this.pos.x, this.pos.y, this.pos.x + newAcc.x * 10, this.pos.y + newAcc.y * 10);
        this.acc.add(newAcc);
    }

    checkEdges(width, height) {
        // Steer away from edges
        let newAcc = createVector(0, 0);
        let amp = 20;
        let radius = this.viewRadius*2;

        if (this.pos.x < radius) {
            newAcc.add(createVector(amp/sqrt(this.pos.x), 0));
        } else if (this.pos.x > width - radius) {
            newAcc.add(createVector(-amp/sqrt(width - this.pos.x), 0));
        }

        if (this.pos.y < radius) {
            newAcc.add(createVector(0, amp/sqrt(this.pos.y)));
        } else if (this.pos.y > height - radius) {
            newAcc.add(createVector(0, -amp/sqrt(height - this.pos.y)));
        }

        if (newAcc.x != 0 || newAcc.y != 0) {
            // stroke(255, 0, 255);
            // strokeWeight(1);
            // line(this.pos.x, this.pos.y, this.pos.x + newAcc.x * 10, this.pos.y + newAcc.y * 10);

            this.acc.add(newAcc);
        }
    }

    steerRandomly() {
        let newAcc = createVector(random(-1, 1), random(-1, 1));
        let steer = p5.Vector.sub(newAcc, this.vel);
        steer.limit(0.1);
        this.acc.add(steer);
    }

    steerAwayFromHand(hand) {
        let newAcc = createVector(0, 0);
        let amp = 5;

        for (let i = 0; i < hand_outline.length - 1; i++) {
            let index = hand_outline[i];
            let next_index = hand_outline[i + 1];
            let v = {
                x: hand[index][0] * width,
                y: hand[index][1] * height
            };

            let w = {
                x: hand[next_index][0] * width,
                y: hand[next_index][1] * height
            };

            let [dist, closest_point] = distToSegment(this.pos, v, w);

            if (dist < 1.5*this.viewRadius) {
                if (closest_point.x < this.pos.x) {
                    newAcc.add(createVector(amp, 0));
                } else if (closest_point.x > this.pos.x) {
                    newAcc.add(createVector(-amp, 0));
                }

                if (closest_point.y < this.pos.y) {
                    newAcc.add(createVector(0, amp));
                } else if (closest_point.y > this.pos.y) {
                    newAcc.add(createVector(0, -amp));
                }
            }
        }

        if (newAcc.x != 0 || newAcc.y != 0) {
            // newAcc.limit(4);
            this.acc.add(newAcc);
        }
    }


    update(boids, hands, width, height) {

        this.steerRandomly();
        let [closerBoids, distances] = this.getCloserBoids(boids);

        if (closerBoids.length > 0) {
            this.checkSeparation(closerBoids, distances);
            this.checkAlignment(closerBoids);
            this.checkCohesion(closerBoids);
        }

        for (let hand of hands) {
            this.steerAwayFromHand(hand);
        }

        this.checkEdges(width, height);

        this.acc.mult(0.1);
        this.vel.add(this.acc);
        this.vel.limit(600/frameRate());
        this.pos.add(this.vel);
        if (this.pos.x < 0) this.pos.x = 0.1;
        if (this.pos.x > width) this.pos.x = width - 0.1;
        if (this.pos.y < 0) this.pos.y = 0.1;
        if (this.pos.y > height) this.pos.y = height - 0.1;
        this.acc.mult(0);
        this.vel.mult(1.01);

        this.mesh.position.set(this.pos.x - width/2, height/2 - this.pos.y, 0);
        this.mesh.rotation.z = atan2(-this.vel.y, this.vel.x) - PI/2;
    }
}


export function generateBoids(amount, width, height, scene) {
    let boids = [];

    for (let i = 0; i < amount; i++) {
        let x = random(width);
        let y = random(height);
        let angle = random(0, 2 * PI);
        let color = [255, 255, 255];

        let boid = new Boid(x, y, angle, color, scene);
        boids.push(boid);
    }

    return boids;
}
