import { PacMan } from "./pac-man";
import { Ghost } from "./characters/ghost";
import { Character } from "./characters/character";
import { Direction } from "./direction";
import { Dot, DotType } from "./characters/dot";
import { Subject, Observable } from "rxjs";

export interface Score {
    total: number,
    blue: number,
    purple: number,
    green: number,
    orange: number,
    red: number
}

export class PacManGame {

    public onDotAdded: Observable<Score>;
    private _onDotAdded: Subject<Score>;

    private canvas: HTMLCanvasElement;
    private pacMan: PacMan;
    private context: CanvasRenderingContext2D;
    private roads: Array<Array<any>>;
    private amoundOfGhosts: number;
    private amoundOfDots: number;

    private ghosts: Ghost[];
    private dots: Dot[];
    private score = {
        total: 0,
        blue: 0,
        purple: 0,
        green: 0,
        orange: 0,
        red: 0
    }

    constructor(
        canvas: HTMLCanvasElement,
        pacMan: PacMan,
        roads: Array<Array<any>>,
        amoundOfGhosts: number,
        amoundOfDots: number
    ) {
        this.canvas = canvas;
        this.pacMan = pacMan;
        this.context = canvas.getContext('2d');
        this.roads = roads;
        this.amoundOfGhosts = amoundOfGhosts;
        this.amoundOfDots = amoundOfDots;
        this.ghosts = [];
        this.dots = [];
        this.addGhosts(this.amoundOfGhosts);
        this.addDots(this.amoundOfDots);
        this.setStartingPosition();
        window.addEventListener("keydown", (event) => {
            this.keyPressed(event)
        }, false);
        window.requestAnimationFrame((event) => { 
            this.renderFrame();
        });
        this._onDotAdded = new Subject<Score>();
        this.onDotAdded = this._onDotAdded.asObservable();
    }

    getRandomPositionOnRoad(size: number): { x: number, y: number } {
        let point = { x: null, y: null };
        while (point.x === null || !this.isPointInScreen(point, size)) {
            let randomRoad = this.roads[Math.floor(Math.random() * this.roads.length)];
            let randomPoint = randomRoad[Math.floor(Math.random() * randomRoad.length)];
            point.x = randomPoint.x;
            point.y = randomPoint.y;
        }

        return point;
    }

    setStartingPosition(): void {
        if (this.pacMan) {
            let randomPoint = this.getRandomPositionOnRoad(this.pacMan.size);
            this.pacMan.x = randomPoint.x;
            this.pacMan.y = randomPoint.y;
            if (this.pacMan.hasGhostCollision(this.ghosts) || this.pacMan.hasDotCollision(this.dots)) {
                this.setStartingPosition();
            }
        }
    }

    /**
     * if the point is in teh canvas ..
     * @param point
     */
    isPointInScreen(point, size: number): boolean {
        return point.x >= size &&
            point.y >= size &&
            point.x <= (this.canvas.width - size) &&
            point.y <= (this.canvas.height - size);
    }

    addGhosts(numberOfGhosts: number): void {
        for (let i = 0; i < numberOfGhosts; i++) {
            let randomPoint = this.getRandomPositionOnRoad(50);
            this.ghosts.push(
                new Ghost(
                    randomPoint.x,
                    randomPoint.y
                ));
        }
    }

    addDots(numberOfDots: number): void {
        let i = 0;
        while(i < numberOfDots) {
            const randomPoint = this.getRandomPositionOnRoad(20);
            const fields = Object.keys(DotType);
            const index = Math.floor(Math.random() * fields.length);
            const newDot = new Dot(DotType[fields[index]], randomPoint.x, randomPoint.y);
        
            if (!newDot.getDetectedCollision(this.dots)) {
                this.dots.push(newDot);
                i++;
            }
        }
    }

    /**
     * the cicles redrawing in frames 
     */
    renderFrame(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.draw();
        window.requestAnimationFrame((event) => { this.renderFrame() });
    }

    keyPressed(event): void{
        event.preventDefault();
        switch (event.key) {
            case "ArrowUp":
                this.move(this.pacMan, Direction.Up);
                break;
            case "ArrowDown":
                this.move(this.pacMan, Direction.Down);
                break;
            case "ArrowLeft":
                this.move(this.pacMan, Direction.Left);
                break;
            case "ArrowRight":
                this.move(this.pacMan, Direction.Right);
                break;
        }
    }

    draw(): void {
        this.drawGhosts();
        this.drawPackMan();
        this.drawDots();
        this.drawRoads();
        this.ghosts.forEach((ghost: Ghost) => {
            this.moveGhostRendumly(ghost);
        });
        this.detectCollisions();       
    }

    drawRoads(): void {
        this.context.beginPath();
        this.context.strokeStyle = 'rgb(168, 132, 119, 0.9)';
        this.context.lineWidth = 25;
  
        this.roads.forEach(road => {
            road.forEach((point, index) => {
                if (index == 0) {
                    this.context.moveTo(point.x, point.y);
                } else {
                    this.context.lineTo(point.x, point.y);
                }
            });
        });
        this.context.globalAlpha=1;
        this.context.stroke();
    }

    drawEye(): void {
        let radiusEye = {x: 5, y: 6};
        let posEye = {x: 4, y: -10};
        let irusEye = {x: 6, y: -10};
        switch (this.pacMan.direction) {
            case Direction.Right:
                posEye = {x: 4, y: -10};
                break;
            case Direction.Left:
                posEye = {x: -4, y: -10};
                irusEye = {x: -6, y: -10};
                break;
            case Direction.Down:
                radiusEye = {x: 6, y: 5};
                irusEye = {x: 10, y: 3};
                posEye = {x: 10, y: 2};
                break;
            case Direction.Up:
                radiusEye = {x: 6, y: 5};
                irusEye = {x: 12, y: -6};
                posEye = {x: 12, y: -4};
                break;
        }
            
        // irus ...
        this.context.beginPath();
        this.context.arc(this.pacMan.x + irusEye.x, this.pacMan.y + irusEye.y, 3, 0, 2 * Math.PI);
        this.context.fillStyle = '#000';
        this.context.fill();
        
        // oog ...
        this.context.beginPath();
        this.context.ellipse(this.pacMan.x + posEye.x, this.pacMan.y + posEye.y, radiusEye.x, radiusEye.y, 0, 0, Math.PI*2);
        this.context.fillStyle = '#fff';
        this.context.fill();

        // border ..
        this.context.beginPath();
        this.context.ellipse(this.pacMan.x + posEye.x, this.pacMan.y + posEye.y, radiusEye.x, radiusEye.y, 0, 0, Math.PI*2);
        this.context.strokeStyle = '#000';
        this.context.lineWidth = 1;
        this.context.stroke();
    }

    drawPackMan(): void {   

        this.drawEye();
        this.context.beginPath();   

        if (this.pacMan.mouthOpenValue <= 0) {
            this.pacMan.mouthPosition = 1;
        } else if (this.pacMan.mouthOpenValue >= 40) {
            this.pacMan.mouthPosition = -1;
        }
        this.pacMan.mouthOpenValue += (5 * this.pacMan.mouthPosition);

        switch (this.pacMan.direction) {
            case Direction.Right:
                this.context.arc(this.pacMan.x, this.pacMan.y, this.pacMan.size,
                    (Math.PI / 180) * this.pacMan.mouthOpenValue,
                    (Math.PI / 180) * (360 - this.pacMan.mouthOpenValue)
                );
                break;
            case Direction.Left:
                this.context.arc(this.pacMan.x, this.pacMan.y, this.pacMan.size,
                    (Math.PI / 180) * (179 - this.pacMan.mouthOpenValue),
                    (Math.PI / 180) * (180 + this.pacMan.mouthOpenValue),
                    true
                );
                break;
            case Direction.Down:
                this.context.arc(this.pacMan.x, this.pacMan.y, this.pacMan.size,
                    (Math.PI / 180) * (89 - this.pacMan.mouthOpenValue),
                    (Math.PI / 180) * (90 + this.pacMan.mouthOpenValue),
                    true
                );
                break;
            case Direction.Up:
                this.context.arc(this.pacMan.x, this.pacMan.y, this.pacMan.size,
                    (Math.PI / 180) * (269 - this.pacMan.mouthOpenValue),
                    (Math.PI / 180) * (270 + this.pacMan.mouthOpenValue),
                    true
                );
                break;
        }
        this.context.globalAlpha=1;
        this.context.globalCompositeOperation = 'destination-over';

        this.context.lineTo(this.pacMan.x, this.pacMan.y);
        this.context.fillStyle = this.pacMan.color;
        this.context.fill();
    }

    drawGhosts(): void {
        this.context.beginPath();
        this.ghosts.forEach(ghost => {
            this.context.drawImage(ghost.image, ghost.x - (ghost.size / 2), (ghost.y - (ghost.size / 2)));
        });
    }

    drawDots(): void {
        this.dots.forEach(dot => {
            this.context.beginPath();
            this.context.drawImage(dot.image, dot.x - (dot.size / 2), dot.y - (dot.size / 2));
        });
    }

    move(character: Character, direction: number): boolean {
        let canMove = false;
        let point = character.newPosition(direction);
        if (this.context.isPointInStroke(point.x, point.y)) {
            if (this.isPointInScreen(point, character.size)) {
                character.direction = direction;
                character.x = point.x;
                character.y = point.y;
                canMove = true;
            }
        }
        return canMove;
    }

    moveGhostRendumly(ghost: Ghost): void {
        const direction: Direction = ghost.getDirection();
        if (!this.move(ghost, direction)) {
            ghost.moveToOtherDirection();
        }
    }

    detectCollisions() {
        if (this.pacMan.hasGhostCollision(this.ghosts)) {
            window.requestAnimationFrame = null;
            if(confirm("YOU ARE DEAD! \r\n You have " + this.score.total + " points!")) {
                window.location.reload();
            }
        }
        if (this.pacMan.hasDotCollision(this.dots)) {
            const result = this.pacMan.getDetectedCollision(this.dots);
            const dot = (result.character as Dot);
            const point = dot.point;
            this.score.total = this.score.total + point;
            this.score[dot.type] = this.score[dot.type] + 1;
            this.dots.splice(result.index, 1);
            console.log(""+ point +" points!, total amound: " + this.score.total );
            this._onDotAdded.next(this.score);
        }
    }
}