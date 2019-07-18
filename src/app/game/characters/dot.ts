import { Character } from "./character";

export enum DotType {
    orange = 'orange',
    red = 'red',
    purple = 'purple',
    green = 'green',
    blue = 'blue'
}
export enum DotPoint {
    orange = 5,
    red = 4,
    purple = 3,
    green = 2,
    blue = 1
}
export class Dot extends Character {
    public imgPath: string;
    public image: any;
    public color: string;
    public type: DotType;
    public point: number;
    constructor(type: DotType, x: number, y: number) {
        super();
        this.type = type;
        this.imgPath = `./assets/icons/dot-${this.type}.png`;
        this.x = x;
        this.y = y;
        this.image = new Image();
        this.image.src = this.imgPath;
        this.size = 25;
        this.point = DotPoint[type];
    }
}
