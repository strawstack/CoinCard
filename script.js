(() => {

    class Machine {
        constructor() {
            
          }
    }

    class CenterMachine {
        constructor(svg, CELL_SIZE, {col, row}) {
            this.svg = svg;
            this.col = col;
            this.row = row;

            this.coinStore = 0;
            this.STROKE = 3;
            this.SIZE = 75 - 2 * this.STROKE;
            this.ARM_SIZE = 25 - 2 * this.STROKE;
            this.CENTER = {
                x: col * CELL_SIZE + CELL_SIZE/2, 
                y: row * CELL_SIZE + CELL_SIZE/2
            };
            
            this.group = this.createGroup(this.CENTER);

            this.outerCircle = this.createOuterCircle(
                0, 0,
                this.SIZE/2
            );

            let top_arm = this.createCoinArm("top");
            let right_arm = this.createCoinArm("right");
            let bottom_arm = this.createCoinArm("bottom");
            let left_arm =  this.createCoinArm("left");
            this.arms = [ top_arm, right_arm, bottom_arm, left_arm];

            // Handle click on coinArms
            this.arms[1].addEventListener("click", (e) => this.handleCoinArmClick(e));

            // Append elements in draw order
            this.svg.appendChild(this.group);
            this.group.appendChild(this.outerCircle);
            this.group.appendChild(top_arm);
            this.group.appendChild(right_arm);
            this.group.appendChild(bottom_arm);
            this.group.appendChild(left_arm);

        }
        createGroup({x, y}) {
            const svgns = "http://www.w3.org/2000/svg";
            let g = document.createElementNS(svgns, "g");
            g.setAttribute("transform", `translate(${x}, ${y})`);
            return g;
        }
        createCircle(cx, cy, r) {
            const svgns = "http://www.w3.org/2000/svg";
            let circle = document.createElementNS(svgns, "circle");
            circle.setAttribute("cx", cx);
            circle.setAttribute("cy", cy);
            circle.setAttribute("r", r);
            return circle;
        }
        createOuterCircle(cx, cy, r) {
            let outerCircle = this.createCircle(cx, cy, r);
            outerCircle.setAttribute("class", "outerCircle");
            return outerCircle;
        }
        createCoinArm(pos) {

            let centx = this.CENTER.x;
            let centy = this.CENTER.y;
            let size2 = this.SIZE/2;
            let arm_size2 = this.ARM_SIZE/2;
            let pad = 3;

            let lookup = {
                "top": {cx: 0, cy: -size2 + arm_size2 + pad},
                "right": {cx: size2 - arm_size2 - pad, cy: 0},
                "bottom": {cx: 0, cy: size2 - arm_size2 - pad},
                "left": {cx: -size2 + arm_size2 + pad, cy: 0}
            }
            let {cx, cy} = lookup[pos];
            let coinArm = this.createCircle(cx, cy, arm_size2);
            coinArm.setAttribute("class", "coinArm");
            return coinArm;
        }
        handleCoinArmClick(e) {
            let coinArm = e.target;
            let BASE_CLASS = "coinArm";
            coinArm.setAttribute("class", `${BASE_CLASS} rightArmOut`);
            setTimeout(() => {
                p("moved out");
            }, 1000);

            // TODO - finisg implementation and find the right distance for
                // coinArms to travel

        }
    }

    function p(text) {
        console.log(text);
    }

    function getDocumentBodySize() {
        const WIDTH  = window.innerWidth;
        const HEIGHT = window.innerHeight;
        return {
            WIDTH, HEIGHT
        };
    }

    function getDocumentBodySizeAsMultipleOf(CELL_SIZE) {
        const { WIDTH, HEIGHT } = getDocumentBodySize();
        const ROWS = Math.floor( HEIGHT / CELL_SIZE );
        const COLS = Math.floor( WIDTH / CELL_SIZE );
        return {
            WIDTH: COLS * CELL_SIZE,
            HEIGHT: ROWS * CELL_SIZE,
            ROWS: ROWS,
            COLS: COLS
        };
    }

    function makeLine(x1, y1, x2, y2) {
        const svgns = "http://www.w3.org/2000/svg";
        let line = document.createElementNS(svgns, "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        return line;
    }

    function makeText(CELL_SIZE, x, y, value) {
        let text = document.createElement("div");
        text.style.top = `${y - CELL_SIZE/2}px`;
        text.style.left = `${x - CELL_SIZE/2}px`;
        text.style.width = `${CELL_SIZE}px`;
        text.style.height = `${CELL_SIZE}px`;
        text.textContent = value;
        text.className = "textContainer";
        return text;
    }

    function drawGridLines(svg, CELL_SIZE, WIDTH, HEIGHT, COLS, ROWS) {
        
        let line = makeLine(0, 1, WIDTH, 1);
        line.setAttribute("class", "gridLine");
        svg.appendChild(line);

        svg.appendChild(line);
        for (let r = 0; r < ROWS; r++) {
            let line = makeLine(0, r * CELL_SIZE - 1, WIDTH, r * CELL_SIZE - 1);
            line.setAttribute("class", "gridLine");
            svg.appendChild(line);
        }

        line = makeLine(0, HEIGHT - 1, WIDTH, HEIGHT - 1);
        line.setAttribute("class", "gridLine");
        svg.appendChild(line);

        line = makeLine(1, 0, 1, HEIGHT);
        line.setAttribute("class", "gridLine");
        svg.appendChild(line);

        for (let c = 0; c < COLS; c++) {
            let line = makeLine(c * CELL_SIZE - 1, 0, c * CELL_SIZE - 1, HEIGHT);
            line.setAttribute("class", "gridLine");
            svg.appendChild(line);
        }

        line = makeLine(WIDTH - 1, 0, WIDTH - 1, HEIGHT);
        line.setAttribute("class", "gridLine");
        svg.appendChild(line);
    }

    function makeGrid(svg, CELL_SIZE, ROWS, COLS) {
        let grid = [];

        /* A cell can have the following states:
         *  Number: contains a number 0 to 9.
         *  Machine: contains a machine.
         *  Open: the player can buy the cell at which time it will become a machine.
         */

        for (let r = 0; r < ROWS; r++) {
            let row = [];
            for (let c = 0; c < COLS; c++) {
                let item = {
                    type: "number",
                    value: (Math.floor(Math.random() * 9) + 1), // 1 to 9
                    ref: null
                };
                row.push(item);
            }
            grid.push(row);
        }

        // Add three open cells
        for (let i = 0; i < 3; i++) {
            let index = Math.floor(Math.random() * 3);
            let costs = [1, 3, 5];
            let r = Math.floor(Math.random() * ROWS);
            let c = Math.floor(Math.random() * COLS);
            grid[r][c] = {
                type: "open",
                cost: costs[index]
            };
        }

        // Create and place center machine
        const CENTER_ROW = Math.floor(ROWS/2);
        const CENTER_COL = Math.floor(COLS/2);

        let centerMachine = new CenterMachine(svg, 
            CELL_SIZE,
            { col: CENTER_COL, row: CENTER_ROW }
        );

        grid[CENTER_ROW][CENTER_COL] = {
            type: "machine",
            ref: centerMachine
        };

        return grid;
    }

    function placeItems(overlay, ROWS, COLS, CELL_SIZE, grid) {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                switch(grid[r][c].type) {
                    case "number":
                        let text = makeText(
                            CELL_SIZE,  
                            40 + CELL_SIZE * c,
                            40 + CELL_SIZE * r,
                            grid[r][c].value);
                        grid[r][c].ref = text;
                        overlay.appendChild(text);
                        break;
                }
            }
        }
    }

    function main() {

        // Constants
        const CELL_SIZE = 80;
        const { WIDTH, HEIGHT, ROWS, COLS } = getDocumentBodySizeAsMultipleOf(CELL_SIZE);

        // Elements
        const container = document.querySelector(".container");
        const svg = document.querySelector("svg");
        const overlay = document.querySelector(".overlay");
        
        // Draw grid lines
        drawGridLines(svg, CELL_SIZE, WIDTH, HEIGHT, COLS, ROWS);

        // Variables
        let grid = makeGrid(svg, CELL_SIZE, ROWS, COLS);
        
        // Fill screen with SVG, and overlay
        container.style.width = `${WIDTH}px`;
        container.style.height = `${HEIGHT}px`;
        svg.setAttribute("width", WIDTH);
        svg.setAttribute("height", HEIGHT);
        
        // Place items in cells
        placeItems(overlay, ROWS, COLS, CELL_SIZE, grid);

    }

    main();

})();