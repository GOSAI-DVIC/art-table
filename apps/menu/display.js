export const menu = new p5((sketch) => {
    sketch.name = "menu";
    sketch.z_index = 5;
    sketch.activated = false;

    let sign = "None";
    let prob = 0;

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height)
            .position(0, 0)
            .style("z-index", sketch.z_index);

        socket.on(sketch.name, (data) => {
            // console.log(data);
            if (data.length > 0) {
                sign = data[0][0];
                prob = data[0][1];
            }
        });

        socket.on("list_applications", (data) => {
            console.log(data);
        });

        sketch.emit = (name, data) => {
            socket.emit(name, data);
        };

        sketch.activated = true;
    };

    sketch.resume = () => {};

    sketch.pause = () => {};

    sketch.windowResized = () => {
        sketch.resizeCanvas(windowWidth, windowHeight);
    };

    sketch.update = () => {
    };

    sketch.show = () => {
        sketch.clear();
        // sketch.fill(255);
        // sketch.textSize(32);
        // sketch.text(sign, sketch.width / 2, sketch.height / 2);
        // sketch.textSize(16);
        // sketch.text(prob, sketch.width / 2, sketch.height / 2 + 32);

    };
});
