import { Direction } from "../direction";

export abstract class Character
{
    private directions: Direction[];
    public currentDirection: number;
    public x = 0;
    public y = 0;
    public direction: number;
    public stepSize = 10;
    public size: number;

    constructor() {
        this.directions = [Direction.Down, Direction.Left, Direction.Up, Direction.Right];
        this.currentDirection = 0; 
    }

    public updatePosition(pos: {x: number, y: number}): void {
        this.x = pos.x;
        this.y = pos.y;
    }

    public moveToOtherDirection(): Direction {
        this.currentDirection = Math.floor(Math.random() * this.directions.length);
        return this.getDirection();
    }

    public getDirection(): Direction {
        return this.directions[this.currentDirection];
    }

    public newPosition(direction: number): any {
        let point = { x: null, y: null };
        if (direction === 1 || direction === -1) {
            point.x = this.x + (this.stepSize * direction);
            point.y = this.y;
        } else {
            point.x = this.x;
            point.y = this.y + (this.stepSize * (direction / 2));
        }
        return point;
    }

    getDetectedCollision(characters: Character[]): {index: number, character: Character} {
        let collisionResult = null;
        characters.forEach((o,i) => {
            if (
                this.x - this.size / 2 < o.x + this.size / 2 &&               
                this.x + this.size / 2 > o.x - this.size / 2 &&
                this.y - this.size / 2 < o.y + this.size / 2 &&
                this.y + this.size / 2 > o.y - this.size / 2) {
                    collisionResult = {index: i, character: o};
             }
        });

        return collisionResult;
    }
}

