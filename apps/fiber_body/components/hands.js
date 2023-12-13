import * as THREE from "https://unpkg.com/three@0.156.1/build/three.module.js";
import * as BufferGeometryUtils from "https://unpkg.com/three/examples/jsm/utils/BufferGeometryUtils.js";

const tubes_paths = [
    [0, 1, 2, 3, 4],
    [0, 5, 6, 7, 8],
    [0, 9, 10, 11, 12],
    [0, 13, 14, 15, 16],
    [0, 17, 18, 19, 20],
    [0, 1, 2, 3, 4],
    [0, 5, 6, 7, 8],
    [0, 9, 10, 11, 12],
    [0, 13, 14, 15, 16],
    [0, 17, 18, 19, 20]
]

const tube_radius = 10;
const tube_segments = 64;
const tube_radius_segments = 4;


export function generateHand(hand_landmarks, width, height) {
    // Create the mesh of a tube_hand
    // A tube_hand is composed of tubes that connect the joints of the hand


    let tube_hand = new THREE.Group();

    let tube_meshes = [];
    for (let i = 0; i < tubes_paths.length; i++) {
        let tube_path = tubes_paths[i];

        const tube_material = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;
                varying float vProgress;
                uniform float time;
                void main() {
                    vUv = uv;
                    vNormal = normal;
                    vPosition = position;
                    vProgress = smoothstep(-1.0, 1.0, sin(uv.x*10.0 + time) + sin(uv.x*3.0 - 0.5*time + 2.0)) + 1.5*smoothstep(0.85, 1.0, vUv.x) + smoothstep(0.1, 0.0, vUv.x);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying float vProgress;
                varying vec2 vUv;
                uniform float time;
                void main() {
                    // vec3 color = vec3(1.0, 0.3, 0.2);
                    vec3 color = vec3(0.2, 0.5, 1.0);
                    vec3 finalColor = mix(color*0.05, color, pow(vProgress, 5.0));

                    // float alpha = 1.0;
                    float alpha = smoothstep(0.0, 0.1, vUv.x);
                    // float alpha = max(smoothstep(1.0, 0.9, vUv.x) * smoothstep(0.0, 0.1, vUv.x) - length(vNormal) * smoothstep(0.8, 1.0, vUv.x), 0.0);

                    gl_FragColor.rgba = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                time: {
                    value: random(20)
                }
            }
        });

        let tube_geometry = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(tube_path.map(j => new THREE.Vector3(
                (hand_landmarks[j][0] - 0.5) * width,
                (0.5 - hand_landmarks[j][1]) * height,
                0
            ))),
            tube_segments,
            tube_radius,
            tube_radius_segments,
            false
        );
        tube_meshes.push(new THREE.Mesh(tube_geometry, tube_material))
    }

    tube_hand.add(...tube_meshes)

    return tube_hand;
}


export function updateTubesPosition(hand_landmarks, tube_hand, width, height) {

    for (let i = 0; i < tubes_paths.length; i++) {
        let tube_path = tubes_paths[i];

        let tube_geometry = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(tube_path.map(j => new THREE.Vector3(
                (hand_landmarks[j][0] - 0.5) * width,
                (0.5 - hand_landmarks[j][1]) * height,
                0
            ))),
            tube_segments,
            tube_radius,
            tube_radius_segments,
            false
        );

        delete tube_hand.children[i].geometry;
        tube_hand.children[i].geometry = tube_geometry;
        tube_hand.children[i].material.uniforms.time.value -= 0.05;
    }
    // console.log(tube_hand.children[0].material.uniforms.time.value)
}
