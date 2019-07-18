import { Character } from "./character";

export class Ghost extends Character {
    public readonly imgPath = './assets/icons/ghost.png';
    public image: any;

    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
        this.size = 50;
        this.image = new Image();
        this.image.src = this.imgPath;
        this.stepSize = 0.5;
    }
}