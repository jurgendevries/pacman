import { Character } from "./characters/character";
import { Ghost } from "./characters/ghost";
import { Dot } from "./characters/dot";

export class PacMan extends Character {
    public color: string;
    constructor(
        public mouthOpenValue: number,
        public mouthPosition: number,
        public direction: number,
        public size: number
    ) {
        super();
        this.direction = direction;
        this.color = '#FF0';
        this.size = size;
    }

    hasGhostCollision(ghosts: Ghost[]): boolean {
        return this.getDetectedCollision(ghosts) !== null;
    }

    hasDotCollision(dots: Dot[]): boolean {
        return this.getDetectedCollision(dots) !== null;
    }
}
