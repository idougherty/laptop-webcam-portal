
export default class DrawTools {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor(videoElementId: string) {
        this.canvas = document.getElementById(videoElementId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d");
    }
}
