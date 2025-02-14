import { FilesetResolver, FaceLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";
import DrawTools from "./draw-tools";
import Vector from "./vector";

declare interface Connection {
    start: number;
    end: number;
}

declare interface EyePositions {
    left: Vector;
    right: Vector;
}

export default class EyeLocator {

    faceLandmarker: FaceLandmarker;

    async init() {
        const vision = await FilesetResolver.forVisionTasks(
            // path/to/wasm/root
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );

        this.faceLandmarker = await FaceLandmarker.createFromOptions(
            vision,
            {
                baseOptions: {
                    modelAssetPath: "/models/face_landmarker.task"
                },
                runningMode: "VIDEO",
            });
    }
    
    processFrame(video: HTMLVideoElement): NormalizedLandmark[] {
        const result = this.faceLandmarker.detectForVideo(video, video.currentTime * 1000);
    
        if(result.faceLandmarks.length == 0)
            return null;

        return result.faceLandmarks[0]; 
    }

    processLandmarks(landmarks: NormalizedLandmark[]): EyePositions {
         
        let left = this.estimateEyePosition(FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, landmarks);
        let right = this.estimateEyePosition(FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, landmarks);
    
        return {right, left};
    }

    estimateEyePosition(connections: Connection[], landmarks: NormalizedLandmark[]): Vector {
        let min = 2;
        let max = -1;
        let avgX = 0;
        let avgY = 0;
    
        for(const connection of connections) {
            let start = landmarks[connection.start];
            min = Math.min(start.x, min);
            max = Math.max(start.x, max);
            avgX += start.x;
            avgY += start.y;
        }
    
        avgX /= connections.length;
        avgY /= connections.length;
    
        // https://medium.com/@susanne.thierfelder/create-your-own-depth-measuring-tool-with-mediapipe-facemesh-in-javascript-ae90abae2362
        
        var focalLength = 1.66; // may need tuning
        var irisDiameter = max - min;
        var avgDiameter = 11.7;
        var z = (focalLength * (avgDiameter / irisDiameter))/10.0;
    
        // x is negative since camera is flipped
        var x = -(avgX - 0.5) / focalLength * z;
        var y = (avgY - 0.5) / focalLength * z;
    
        return {x, y, z};
    }

    drawLandmarks({canvas, ctx}: DrawTools, connections: Connection[], landmarks: NormalizedLandmark[]): void {

        ctx.beginPath();

        for(const connection of connections) {
            let start = landmarks[connection.start];
            let end = landmarks[connection.end];
            ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
            ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
        }

        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 5;
        ctx.stroke();
    }

    drawDebugInfo(draw: DrawTools, landmarks: NormalizedLandmark[], leftEye: Vector, rightEye: Vector) {
   
        this.drawLandmarks(draw, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, landmarks);
        this.drawLandmarks(draw, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, landmarks);
    
        const {ctx} = draw;
        ctx.font = "20px serif";
        ctx.fillText(`leftX: ${leftEye.x.toFixed(1)}`, 10, 50);
        ctx.fillText(`leftY: ${leftEye.y.toFixed(1)}`, 10, 70);
        ctx.fillText(`leftZ: ${leftEye.z.toFixed(1)}`, 10, 90);
        ctx.fillText(`rightX: ${rightEye.x.toFixed(1)}`, 10, 110);
        ctx.fillText(`rightY: ${rightEye.y.toFixed(1)}`, 10, 130);
        ctx.fillText(`rightZ: ${rightEye.z.toFixed(1)}`, 10, 150);
        ctx.fillText(`pupil dist: ${(leftEye.x - rightEye.x).toFixed(1)}`, 10, 170);
    }
}