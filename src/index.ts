import Vector from "./vector";
import EyeLocator from "./eye-locator";
import DrawTools from "./draw-tools";
import WebGLInit from "./webgl-init";
import drawScene from "./draw-scene";
import {vec3} from "gl-matrix";

let videoElement: HTMLVideoElement;
let overlayScale = 0.5;
let overlay: DrawTools;
let gl: WebGLRenderingContext;
let eyeLocator: EyeLocator;
let programInfo: any;
let buffers: any;
let texture: WebGLTexture;

let cubeRotation: number;

function renderLoop(): void {

    overlay.ctx.clearRect(0, 0, overlay.canvas.width, overlay.canvas.height);

    const landmarks = eyeLocator.processFrame(videoElement);

    if(landmarks == null) {
        videoElement.requestVideoFrameCallback(renderLoop);
        return;
    }

    const {left, right} = eyeLocator.processLandmarks(landmarks);
    
    eyeLocator.drawDebugInfo(overlay, landmarks, left, right);

    const cameraVector = Vector.div(Vector.add(left, right), 2);
    const cameraVec3: vec3 = [cameraVector.x, -cameraVector.y, -cameraVector.z];
    // drawWorld(Vector.div(Vector.add(left, right), 2));

    // const cameraPos: vec3 = [0, 0, -6]
    // cubeRotation = Date.now() / 1000;
    cubeRotation = 0;
    drawScene(gl, programInfo, buffers, texture, cubeRotation, cameraVec3);
    
    videoElement.requestVideoFrameCallback(renderLoop);
}

function videoSetup() {
    overlay.canvas.height = videoElement.videoHeight * overlayScale;
    overlay.canvas.width = videoElement.videoWidth * overlayScale;
    videoElement.style.width = videoElement.videoWidth * overlayScale + "px";

    gl.canvas.width = window.innerWidth;
    gl.canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const result = WebGLInit(gl);
    programInfo = result.programInfo;
    buffers = result.buffers;
    texture = result.texture;

    renderLoop();
}


window.onload = async () => {
    videoElement = document.getElementById('inputVideo') as HTMLVideoElement;
    
    overlay = new DrawTools("overlay");

    const canvas = document.getElementById('virtual') as HTMLCanvasElement;
    gl = canvas.getContext("webgl");

    eyeLocator = new EyeLocator();
    await eyeLocator.init();

    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    videoElement.srcObject = stream;
    videoElement.onloadedmetadata = videoSetup;
};














// function drawSquare(camera: Vector, center: Vector, size: number, color: string) {
    //     const worldPos = Vector.sub(center, {x: size/2, y: size/2, z: 0})
    
    //     let relativePos = Vector.sub(camera, worldPos);
    //     let scale = camera.z / relativePos.z;
    
    //     let projPos = {x: relativePos.x * scale, y: relativePos.y * scale, z: 0};
    //     projPos = Vector.sub(camera, projPos);
        
    //     const pixelsPerCentimeter = 63;
    //     let projSize = size * scale * pixelsPerCentimeter;
    //     projPos = Vector.mult(projPos, pixelsPerCentimeter);
        
    //     screen.ctx.fillStyle = color;
    //     screen.ctx.fillRect(projPos.x + screen.canvas.width/2, projPos.y, projSize, projSize);
    // }
    
    // function drawWorld(camera: Vector) {
    //     screen.ctx.fillStyle = "#121212";
    //     screen.ctx.fillRect(0, 0, screen.canvas.width, screen.canvas.height);
    
    //     const screenWidth = 30;
    //     const screenHeight = 18;
    
    //     console.log(camera);
    
    //     drawSquare(camera, {x: -3, y: 8, z: -26}, 4, "#811");
    //     drawSquare(camera, {x: -3, y: 8, z: -25}, 4, "#922");
    //     drawSquare(camera, {x: -3, y: 8, z: -24}, 4, "#a33");
    //     drawSquare(camera, {x: -3, y: 8, z: -23}, 4, "#b44");
    //     drawSquare(camera, {x: -3, y: 8, z: -22}, 4, "#c55");
    
    //     drawSquare(camera, {x: 3, y: 8, z: -6}, 4, "#811");
    //     drawSquare(camera, {x: 3, y: 8, z: -5}, 4, "#922");
    //     drawSquare(camera, {x: 3, y: 8, z: -4}, 4, "#a33");
    //     drawSquare(camera, {x: 3, y: 8, z: -3}, 4, "#b44");
    //     drawSquare(camera, {x: 3, y: 8, z: -2}, 4, "#c55");
    
    //     drawSquare(camera, {x: -3, y: 8, z: 2}, 4, "#811");
    //     drawSquare(camera, {x: -3, y: 8, z: 3}, 4, "#922");
    //     drawSquare(camera, {x: -3, y: 8, z: 4}, 4, "#a33");
    //     drawSquare(camera, {x: -3, y: 8, z: 5}, 4, "#b44");
    //     drawSquare(camera, {x: -3, y: 8, z: 6}, 4, "#c55");
    // }