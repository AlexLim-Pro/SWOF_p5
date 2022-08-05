const MAX_LONGITUDE = 180;
const MAX_LATITUDE = 90;
const VIEW_SCALE = 50;
const POINT_RADIUS = 2;
const MAP_LINE_WIDTH = 0.5;
const SHOW_ERRORS = true;

const coordsHT = new Map();
const riverShapeHT = new Map();
const connectivityHT = new Map();


var coordinateDataURL = "https://raw.githubusercontent.com/AlexLim-Pro/SWOF_Sample_Data/main/data/coords_San_Guad.csv";
var riverShapeDataFilePath = "./assets/NHDFlowline_San_Guad/NHDFlowline_San_Guad.shp";
var riverShapeDataFileSHA = "832082317a9254ee1ccdb92786937cb343dff014";
var riverShapeDataURL = `https://api.github.com/repos/AlexLim-Pro/SWOF_Sample_Data/git/blobs/${riverShapeDataFileSHA}`;
var riverConnectivityURL = "https://raw.githubusercontent.com/AlexLim-Pro/SWOF_Sample_Data/main/data/rapid_connect_San_Guad.csv";
var riverConnectivityPath = "data/rapid_connect_San_Guad.csv";
var riverFlowDataFileSHA = "c70811eb578bab8374d797b5d4f081f639f7d5c5";
var riverFlowDataURL = `https://api.github.com/repos/AlexLim-Pro/SWOF_Sample_Data/git/blobs/${riverFlowDataFileSHA}`;
var rividURL = "https://raw.githubusercontent.com/AlexLim-Pro/SWOF_Sample_Data/main/data/rivid.csv";
var QoutURL = "file:///Users/alexlim/Desktop/JPL/DataToDiscovery/RIVERS/SWOF/assets/Qout.csv"


var riverShapeData;
var riverFlowData;


var canvas;
var mapBuffer;
var rightBuffer;


var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
var xScale = windowWidth / MAX_LONGITUDE / 2;
var yScale = windowHeight / MAX_LATITUDE / 2;


var firstX = 0;
var firstY = 0;


var releasedX = 0;
var releasedY = 0;
var selectedPoint = false;
var knownPointId = false;
var selectedPointId = 0;
var downstreamPoints = [];
var knowDownstreamPoints = false;

var rivids = [];


var coordsLoaded = false;
var riverShapeLoaded = false;
var riverFlowLoaded = false;
var rividLoaded = false;

var orientedMap = false;

var firstTime = true;

var backgroundColor = [0, 0, 0];
var defaultContrastColor = [255, 255, 255];

const userPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
const userPrefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
if(!userPrefersDark) {
    backgroundColor = [255, 255, 255];
    defaultContrastColor = [0, 0, 0];
}

// var defaultPointColor = "#4BC0C0";
var defaultPointColor = [75, 192, 192];
var defaultShownAlpha = 255;
var defaultHiddenAlpha = defaultShownAlpha * 0.1;
var defaultDownstreamHiddenAlpha = defaultShownAlpha * 0.2;
var pointShowColor;
var pointHideColor;
var pointDownstreamHideColor;

var defaultLineColor = [255, 255, 255];
var lineShowColor;
var lineHideColor;
var lineDownstreamHideColor;


/**
 * Preprocesses the river data.
 */
function preload() {
    loadCoords();
    loadRiverShape();
    loadRiverFlow();
    loadConnectivity();
    loadRivid();
    backgroundColor = arrayToColor(backgroundColor);
    defaultContrastColor = arrayToColor(defaultContrastColor);
    pointShowColor = arrayToColor(defaultPointColor, defaultShownAlpha);
    pointHideColor = arrayToColor(defaultPointColor, defaultHiddenAlpha);
    pointDownstreamHideColor = arrayToColor(defaultPointColor, defaultDownstreamHiddenAlpha);

    lineShowColor = arrayToColor(defaultLineColor, defaultShownAlpha);
    lineHideColor = arrayToColor(defaultLineColor, defaultHiddenAlpha);
    lineDownstreamHideColor = arrayToColor(defaultLineColor, defaultDownstreamHiddenAlpha);
}


/**
 * Loads the coordinates into the sketch.
 */
function loadCoords() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            fetch(coordinateDataURL)
            .then(res => res.text())
            .then(text => {
                let textArr = text.split("\n");
                for(let i = 0; i < textArr.length; i++) {
                    let rowArr = textArr[i].split(",");
                    coordsHT.set(parseInt(rowArr[0]), [parseFloat(rowArr[1]), parseFloat(rowArr[2])]);
                }
                coordsLoaded = true;
                resolve();
            });
        }, 5000);
    });
}

/**
 * Loads the river shape data into the sketch.
 */
function loadRiverShape() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            fetch(riverShapeDataURL)
            .then((res) => res.json())
            .then((data) => atob(data.content))
            .then((data) => {
                riverShapeData = JSON.parse(data);
                riverShapeLoaded = true;
            });
            resolve();
            });
        }, 5000);
}

/**
 * Loads the river flow data into the sketch.
 */
 function loadRiverFlow() {
    // return new Promise((resolve, reject) => {
    //     setTimeout(() => {
    //         fetch(QoutURL)
    //         .then((res) => res.json())
    //         // .then((data) => atob(data.content))
    //         .then((data) => {
    //             console.log("data");
    //             console.log(atob(data.content));
    //             // riverShapeData = JSON.parse(data);
    //             // let reader = new NetCDFReader(data.content);;
    //             // console.log(data.content);
    //             riverFlowLoaded = true;
    //         });
    //         resolve();
    //         });
    //     }, 5000);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            fetch("./assets/Qout.csv", {
                method: "GET",
                mode: "no-cors",
            })
            .then((res) => res.text())
            .then(text => {
                console.log("done");
                console.log(text);
                riverFlowLoaded = true;
                resolve();
            });
        }, 5000);
    });
}

/**
 * Loads the rivids for the river flows in the sketch.
 */
 function loadRivid() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            fetch(rividURL)
            .then(res => res.text())
            .then(text => {
                rivids = text.split(",");
                rividLoaded = true;
                resolve();
            });
        }, 5000);
    });
}

/**
 * Loads the river connectivity into the sketch.
 */
 function loadConnectivity() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            fetch(riverConnectivityURL)
            .then(res => res.text())
            .then(text => {
                let textArr = text.split("\n");
                for(let i = 0; i < textArr.length; i++) {
                    let rowArr = textArr[i].split(",");
                    connectivityHT.set(parseInt(rowArr[0]), parseInt(rowArr[1]));
                }
                coordsLoaded = true;
                resolve();
            });
        }, 5000);
    });
}

/**
 * Initializes and performs preprocessing setup for the sketch.
 */
function setup() {
    canvas = createCanvas(MAX_LONGITUDE * 2 * xScale, MAX_LATITUDE * 2 * yScale);
    mapBuffer = createGraphics(MAX_LONGITUDE * 2 * xScale / 2, MAX_LATITUDE * 2 * yScale);
    rightBuffer = createGraphics(MAX_LONGITUDE * 2 * xScale / 2, MAX_LATITUDE * 2 * yScale);
    smooth();
    canvas.mouseWheel(e => Controls.zoom(controls).worldZoom(e))
    // rectMode(CENTER);
    frameRate(60);
}

/**
 * Draws the sketch.
 */
function draw() {
    mapBuffer.background(backgroundColor);
    mapBuffer.fill(255, 60, 100);
    rightBuffer.background(backgroundColor);
    rightBuffer.fill(255, 60, 100);
    // background(backgroundColor);
    // fill(255, 60, 100);
    mapBuffer.stroke(defaultPointColor);
    doTransformations();
    // rectMode(CENTER);
    drawEllipses();
    drawLines();

    mapBuffer.fill(255, 60, 100);
    mapBuffer.stroke(defaultPointColor);
    undoTransformations();
    // ellipse(mouseX, mouseY, 100, 100);
    let actualCoords = canvasToCoords(mouseX, mouseY);
    mapBuffer.text(`(${actualCoords[0].toFixed(5)}, ${actualCoords[1].toFixed(5)})`, mouseX, mouseY);
    // text(`(${mouseX}, ${mouseY})`, mouseX, mouseY);
    image(mapBuffer, 0, 0);
    image(rightBuffer, MAX_LONGITUDE * 2 * xScale / 2, MAX_LATITUDE * 2 * yScale)
    if(knowDownstreamPoints) {  // TODO: optimize this so it doesn't have to be done every frame
        noLoop();
    }
}

/**
 * Draws the data points as ellipses.
 */
function drawEllipses() {
    let keySmallest = 0;
    let dSmallest = Infinity;
    let xSmallest = Infinity;
    let ySmallest = Infinity;
    try {
        coordsHT.forEach((value, key) => {
            if(!orientedMap) {
                controls.view.x = value[0];
                controls.view.y = value[1];
                firstX = value[0];
                firstY = value[1];
                orientedMap = true;
            }
            let canvasCoords = coordsToCanvas(value[0], value[1]);
            let c = pointShowColor;
            // let t = drawingContext.getTransform();
            // console.log(t);
            let actualCoords = canvasToCoords(mouseX, mouseY);
            // ellipse(mouseX * t["a"] + mouseY * t["c"] + t["e"], mouseX * t["b"] + mouseY * t["d"] + t["f"], 100, 100);
            // ellipse(winMouseX, winMouseY, 100, 100);
            if(selectedPoint || true) {
                try {
                // undoTransformations();
                // let aCanvas = toNewCanvas(mouseX, mouseY);
                // let ellipses = selectAll("ellipse");
                // console.log(ellipses)
                // // console.log(actualCoords)
                // ellipse(aCanvas[0], aCanvas[1], 100, 100);
                // ellipse(mouseX, mouseY, 100, 100);
                // // console.log("First:", mouseX, mouseY)
                // // console.log()
                // doTransformations();
                // // console.log("Second:", mouseX, mouseY)
                }
                catch(e) {
                    if(SHOW_ERRORS) {
                        console.log(e);
                    }
                }

            }
            if(selectedPoint) {
                if(!knownPointId) {
                    let d = Math.abs(actualCoords[0] - value[0]) ** 2 + Math.abs(actualCoords[1] - value[1]) ** 2;
                    if(d < dSmallest) {
                        console.log("Smallest key:", key);
                        dSmallest = d;
                        keySmallest = key;
                    }
                    if(Math.abs(actualCoords[0] - value[0]) < xSmallest) {
                        xSmallest = Math.abs(actualCoords[0] - value[0]);
                    }
                    if(Math.abs(actualCoords[1] - value[1]) < ySmallest) {
                        ySmallest = Math.abs(actualCoords[1] - value[1]);
                    }
                }
                if(knownPointId) {
                    if(!knowDownstreamPoints) {
                        let currentPointCheck = connectivityHT.get(downstreamPoints[downstreamPoints.length - 1]);
                        while(true) {
                            if(connectivityHT.has(currentPointCheck)) {
                                downstreamPoints.push(currentPointCheck);
                                currentPointCheck = connectivityHT.get(currentPointCheck);
                            }
                            else {
                                knowDownstreamPoints = true;
                                break;
                            }
                        }
                    }
                    if(knowDownstreamPoints) {
                        if(!downstreamPoints.includes(key)) {
                            c = pointHideColor;
                        }
                    }
                }
            }
            mapBuffer.stroke(c);
            mapBuffer.fill(c);
            smooth();
            // mapBuffer.translate(MAX_LONGITUDE * xScale, MAX_LATITUDE * yScale);
            mapBuffer.ellipse(canvasCoords[0], canvasCoords[1], POINT_RADIUS, POINT_RADIUS);
        });
        if(dSmallest != Infinity) {
            console.log(`Smallest distance: ${dSmallest.toFixed(5)}`);
        }
        if(xSmallest != Infinity) {
            console.log("xSmallest:", xSmallest);
        }
        if(ySmallest != Infinity) {
            console.log("ySmallest:", ySmallest);
        }
    }
    catch(e) {
        if(SHOW_ERRORS) {
            console.log(e);
        }
    }
    if(!knownPointId) {
        if(dSmallest < (POINT_RADIUS ** 2) * 2) {
            knownPointId = true;
            selectedPointId = keySmallest;
            console.log(`Selected point ${keySmallest}`);
            downstreamPoints.push(keySmallest);
        }
    }
    if(!knownPointId) {
        selectedPoint = false;
    }
}

/**
 * Draws the rivers as lines.
 */
async function drawLines() {
    try {
        // mapBuffer.stroke(255);
        mapBuffer.strokeWeight(MAP_LINE_WIDTH);
        // if(knowDownstreamPoints) {
        //     if(!downstreamPoints.includes(key)) {
        //         c = pointHideColor;
        //     }
        // }
        // console.log(riverShapeData);
        riverShapeData["features"].forEach((feature) => {
            // console.log(feature["properties"]);
            let comid = feature["properties"]["COMID"];
            let c = lineShowColor;
            if(knowDownstreamPoints) {
                if(!downstreamPoints.includes(comid)) {
                    c = lineHideColor;
                }
            }
            mapBuffer.stroke(c);
            let firstValue = true;
            let xi = 0;
            let yi = 0;
            mapBuffer.beginShape();
            let i = 0;
            // totalCoords += feature["geometry"]["coordinates"].length;
            feature["geometry"]["coordinates"].forEach((coordinate) => {
                if(i % 10 != 0 && i < feature["geometry"]["coordinates"].length - 2) {
                    i++;
                    return;
                }

                let xy = coordsToCanvas(coordinate[0], coordinate[1]);
                // if(!knowDownstreamPoints) {
                //     if(!(key in downstreamPoints)) {
                //         setAlpha(defaultHiddenAlpha);
                //     }
                // }
                let x = xy[0];
                let y = xy[1];
                if(firstValue) {
                    firstValue = false;
                }
                else {
                    mapBuffer.line(xi, yi, x, y);
                }
                xi = x;
                yi = y;
                i++;
            });
            mapBuffer.endShape();
        });
    }
    catch(e) {
        if(SHOW_ERRORS) {
            console.log(e);
        }
    }
}


/**
 * Converts an array containing the red, green, and blue values to a color.
 * @param {[Number, Number, Number]} rgb - An array containing the red, green, and blue values from 0 to 255.
 * @param {Number | 255} alpha - The alpha value from 0 to 255.
 * @returns {Color} - The color.
 */
function arrayToColor(rgb, alpha = 255) {
    return color(rgb[0], rgb[1], rgb[2], alpha);
}


window.addEventListener("resize", function() {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    xScale = windowWidth / MAX_LONGITUDE / 2;
    yScale = windowHeight / MAX_LATITUDE / 2;
    var newPG = createGraphics(MAX_LONGITUDE * 2 * xScale / 2, MAX_LATITUDE * 2 * yScale);
    newPG.image(mapBuffer, 0, 0, newPG.width, newPG.height);
    mapBuffer = newPG;
    var newPG2 = createGraphics(MAX_LONGITUDE * 2 * xScale / 2, MAX_LATITUDE * 2 * yScale);
    newPG2.image(rightBuffer, MAX_LONGITUDE * 2 * xScale / 2, MAX_LATITUDE * 2 * yScale, newPG2.width, newPG2.height);
    rightBuffer = newPG2;
    resizeCanvas(MAX_LONGITUDE * 2 * xScale, MAX_LATITUDE * 2 * yScale);
});


/**
 * Converts the given latitude and longitude in degrees to a point on the canvas map.
 * @param {number | 0} lng - The longitude in degrees.
 * @param {number | 0} lat - The latitude in degrees.
 * @returns {[number, number]} The point on the canvas map.
 */
function coordsToCanvas(lng = 0, lat = 0) {
    // mapBuffer.translate(MAX_LONGITUDE * xScale, MAX_LATITUDE * yScale);
    // mapBuffer.translate(controls.view.x, controls.view.y);
    return [(lng - firstX) * xScale * VIEW_SCALE + controls.view.x,
            (firstY - lat) * yScale * VIEW_SCALE + controls.view.y];
}

/**
 * Converts the given point on the canvas map to a longitude and latitude in degrees.
 * @param {number | 0} x - The x coordinate of the point on the canvas map.
 * @param {number | 0} y - The y coordinate of the point on the canvas map.
 * @returns {[number, number]} The longitude and latitude in degrees.
 */
function canvasToCoords(x = 0, y = 0) {
    return [(x - controls.view.x) / (xScale * VIEW_SCALE) + firstX,
            (y - controls.view.y) / (yScale * VIEW_SCALE) + firstY];
}

/**
 * Converts the given point on the original canvas map to the transformed canvas map.
 * @param {number | 0} xVal - The x coordinate of the point on the canvas map.
 * @param {number | 0} yVal - The y coordinate of the point on the canvas map.
 * @returns {[number, number]} The x and y coordinates of the point on the transformed canvas map.
 */
 function toNewCanvas(xVal = 0, yVal = 0) {
    try {
        let xi = 0;
        xi -= controls.view.x;
        xi *= controls.view.zoom;
        xi += MAX_LONGITUDE * xScale;
        xi += xVal;
        // xi *= 1;
        let yi = 0;
        yi -= controls.view.y;
        yi *= controls.view.zoom;
        yi += MAX_LATITUDE * yScale;
        yi += yVal;
        // yi *= -1;
        return [xi, yi];
    }
    catch(e) {
        if(SHOW_ERRORS) {
            console.log(e);
        }
    }
}

/**
 * Performs map transformations.
 */
function doTransformations() {
    // mapBuffer.translate(controls.view.x, controls.view.y);
    // mapBuffer.scale(controls.view.zoom);
    // mapBuffer.translate(MAX_LONGITUDE * xScale, MAX_LATITUDE * yScale);
    // scale(1, -1);
}

/**
 * Undoes map transformations.
 */
function undoTransformations() {
    // scale(1, -1);
    // mapBuffer.translate(-MAX_LONGITUDE * xScale, -MAX_LATITUDE * yScale);
    // mapBuffer.scale(1 / controls.view.zoom);
    // mapBuffer.translate(-controls.view.x, -controls.view.y);
}


/**
 * Controls object for the sketch.
 */
const controls = {
    view: {x: 0, y: 0, zoom: 1},
    viewPos: { prevX: null,  prevY: null,  isDragging: false },
}

window.mousePressed = e => Controls.move(controls).mousePressed(e);
window.mouseDragged = e => Controls.move(controls).mouseDragged(e);
window.mouseReleased = e => Controls.move(controls).mouseReleased(e);

/**
 * Handles mouse events.
 */
class Controls {
    /**
     * Handles mouse pressed events.
     * @param controls - The controls object.
     */
    static move(controls) {
        /**
         * Handles mouse pressed events.
         * @param {MouseEvent} e - The mouse event.
         */
        function mousePressed(e) {
            controls.viewPos.isDragging = true;
            controls.viewPos.prevX = e.clientX;
            controls.viewPos.prevY = e.clientY;
        }
        
        /**
         * Handles mouse dragged events.
         * @param {MouseEvent} e - The mouse event.
         */
        function mouseDragged(e) {
            const {prevX, prevY, isDragging} = controls.viewPos;
            if(!isDragging) {
                return;
            }

            const pos = {x: e.clientX, y: e.clientY};
            const dx = pos.x - prevX;
            const dy = pos.y - prevY;

            if(prevX || prevY) {
                controls.view.x += dx;
                controls.view.y += dy;
                controls.viewPos.prevX = pos.x, controls.viewPos.prevY = pos.y
            }
        }

        /**
         * Handles mouse released events.
         * @param {MouseEvent} e - The mouse event.
         */
        function mouseReleased(e) {
            controls.viewPos.isDragging = false;
            controls.viewPos.prevX = null;
            controls.viewPos.prevY = null;
            if(orientedMap) {
                releasedX = e.clientX;
                releasedY = e.clientY;
                console.log(releasedX, releasedY);
                selectedPoint = true;
            }
        }

        return {
            mousePressed,
            mouseDragged,
            mouseReleased,
        }
    }

    /**
     * Handles zooming.
     * @param controls - The controls object.
     * @returns - The world zoom level.
     */
    static zoom(controls) {
        function worldZoom(e) {
            const {x, y, deltaY} = e;
            const direction = deltaY > 0 ? -1 : 1;
            const factor = 0.05;
            const zoom = 1 * direction * factor;
    
            const wx = (x - controls.view.x) / (width * controls.view.zoom);
            const wy = (y - controls.view.y) / (height * controls.view.zoom);
            
            controls.view.x -= wx * width * zoom;
            controls.view.y -= wy * height * zoom;
            controls.view.zoom += zoom;
        }
        return { worldZoom }
    }
}