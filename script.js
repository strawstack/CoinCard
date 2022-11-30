(() => {

    class EventSystem {
        constructor(ROWS, COLS) {
            // Types of events:
            // addCoins: coin value increase
            // removeCoins: coin value decrease
            // addMachine: new machine created in cell
            // removeMachine: machine solve from cell
            // addOpenCell: cell becomes open
            this.lookup = {};
        }
        waitForEvent(type, {col, row}) {

        }
        notify(type, {col, row}) {
            let lookup = {
                "addOpenCell": ({col, row}) => this.handleAddOpenCell({col, row}),
            };
            try {
                lookup[type]({col, row});
            } catch(e) {
                p(`Function "${type}" not found.`);
            }
        }
        hash({col, row}) {
            return `${col}:${row}`;
        }
        handleAddOpenCell({col, row}) {
            const h = this.hash({col, row});
            if (h in this.lookup) {
                for (let fn of this.lookup[h]) {
                    fn({col, row});
                }
            }
        }
    }

    class Machine {
        constructor(svg, grid, eventSys, CELL_SIZE, {col, row}, isCenterMachine) {
            this.svg = svg;
            this.grid = grid;
            this.eventSys = eventSys;
            this.col = col;
            this.row = row;
            this.CENTER_MACHINE = isCenterMachine; 

            this.CELL_SIZE = CELL_SIZE;
            this.MAX_COINS = 15;
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
            this.arms[1].addEventListener("click", () => {
                this.handleCoinArmClick(this.grid, "right", right_arm, {col, row});
            });

            // Append elements in draw order
            this.svg.appendChild(this.group);
            this.group.appendChild(this.outerCircle);
            this.group.appendChild(top_arm);
            this.group.appendChild(right_arm);
            this.group.appendChild(bottom_arm);
            this.group.appendChild(left_arm);

            // Create coin store 
            this.coinStore = 0;
            this.coinStoreRef = this.createCoinStore(CELL_SIZE);
            const overlay = document.querySelector(".overlay");
            overlay.appendChild(this.coinStoreRef);
        }
        createGroup({x, y}) {
            const svgns = "http://www.w3.org/2000/svg";
            let g = document.createElementNS(svgns, "g");
            g.setAttribute("transform", `translate(${x}, ${y})`);
            return g;
        }
        createOuterCircle(cx, cy, r) {
            let outerCircle = createCircle(cx, cy, r);
            outerCircle.setAttribute("class", "outerCircle");
            return outerCircle;
        }
        createCoinArm(pos) {
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
            let coinArm = createCircle(cx, cy, arm_size2);
            coinArm.setAttribute("class", "coinArm");
            return coinArm;
        }
        createCoinStore(CELL_SIZE) {
            let textRef = makeText(
                CELL_SIZE, 
                this.CENTER.x, 
                this.CENTER.y - 1, 
                "0", "coinStore");
            return textRef;
        }
        updateGridCoins(grid, {col, row}, removeCoins) {
            const cell = grid[row][col];
            cell.value -= removeCoins;
            if (cell.value > 0) {
                cell.ref.textContent = decimalToHex(cell.value);
            } else {
                // Replace with open cell
                destroyCell(grid, col, row);
                const overlay = document.querySelector(".overlay");
                let index = Math.floor(Math.random() * 3);
                let costs = [1, 3, 5];
                grid[row][col] = {
                    type: "open",
                    cost: costs[index],
                    circle_ref: null,
                    text_ref: null
                };
                let {circle, openText} = createOpenCell(grid, this.CELL_SIZE, col, row)
                grid[row][col].circle_ref = circle;
                grid[row][col].text_ref = openText;
                this.svg.appendChild(circle);
                overlay.appendChild(openText);
                openCellAddClickHandle(this.svg, grid, this.eventSys, 
                    this.CELL_SIZE, col, row);
                // Notify of cell change
                this.eventSys.notify("addOpenCell", {col, row});
            }
        }
        extractCoins(grid, {col, row}) {
            const cell = grid[row][col];
            let numCoins = cell.value;
            if (cell.type === "number") {
                numCoins = Math.min(numCoins, 1);
            }
            const coinSpace = this.MAX_COINS - this.coinStore;
            const removeCoins = Math.min(coinSpace, numCoins);
            this.updateGridCoins(grid, {col, row}, removeCoins);
            return removeCoins;
        }
        updateCoinStore() {
            this.coinStoreRef.textContent = decimalToHex(this.coinStore);
        }
        addCoins(coins) {
            this.coinStore += coins;
            this.updateCoinStore();
            this.eventSys.notify("addCoins", {col: this.col, row: this.row});
        }
        handleCoinArmClick(grid, direction, arm_ref, {col, row}) {
            const offsetLookup = {
                "top": {col: 0, row: -1},
                "right": {col: 1, row: 0},
                "bottom": {col: 0, row: 1},
                "left": {col: -1, row: 0}
            };
            const classNameLookup = {
                "top": {out: "topArmOut", back: "topArmBack"},
                "right": {out: "rightArmOut", back: "rightArmBack"},
                "bottom": {out: "bottomArmOut", back: "bottomArmBack"},
                "left":{out: "leftArmOut", back: "leftArmBack"}
            };
            let offset = offsetLookup[direction];
            let className = classNameLookup[direction];

            let BASE_CLASS = "coinArm";
            arm_ref.setAttribute("class", `${BASE_CLASS} ${className.out}`);
            
            setTimeout(() => {
                let coins = this.extractCoins(grid, {
                    col: col + offset.col, 
                    row: row + offset.row
                });

                let BASE_CLASS = "coinArm";
                arm_ref.setAttribute("class", `${BASE_CLASS} ${className.back}`);
                    
                if (coins > 0) {
                    setTimeout(() => {
                        this.addCoins(coins);
                    }, 1000);
                } else {
                    // TODO - enter the queue
                }
            }, 1000);
        }
    }

    function destroyCell(grid, col, row) {
        const cell = grid[row][col];
        switch(cell.type) {
            case "number":
                cell.ref.remove(); 
                break;
            case "machine":
                break;
            case "open":
                cell.circle_ref.remove();
                cell.text_ref.remove();
                break;
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
    function createCircle(cx, cy, r) {
        const svgns = "http://www.w3.org/2000/svg";
        let circle = document.createElementNS(svgns, "circle");
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", r);
        return circle;
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

    function makeText(CELL_SIZE, x, y, value, addClassName) {
        if (addClassName == undefined) {
            addClassName = "";
        }
        let text = document.createElement("div");
        text.style.top = `${y - CELL_SIZE/2}px`;
        text.style.left = `${x - CELL_SIZE/2}px`;
        text.style.width = `${CELL_SIZE}px`;
        text.style.height = `${CELL_SIZE}px`;
        text.textContent = value;
        text.className = `textContainer ${addClassName}`;
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

    function makeGrid(svg, eventSys, CELL_SIZE, ROWS, COLS) {
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
                    value: (Math.floor(Math.random() * 15) + 1), // 1 to 9
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
                cost: costs[index],
                circle_ref: null,
                text_ref: null
            };
        }

        // Create and place center machine
        const CENTER_ROW = Math.floor(ROWS/2);
        const CENTER_COL = Math.floor(COLS/2);

        // TODO - remove debug settings
        grid[CENTER_ROW][CENTER_COL + 1].value = 1;

        let centerMachine = new Machine(svg,
            grid,
            eventSys,
            CELL_SIZE,
            { col: CENTER_COL, row: CENTER_ROW },
            true // is center machine
        );

        grid[CENTER_ROW][CENTER_COL] = {
            type: "machine",
            ref: centerMachine
        };

        return grid;
    }

    function decimalToHex(decimalNum) {
        let hexLookup = "0123456789ABCDEF";
        return hexLookup[decimalNum];
    }

    function purchaseOpenCell(svg, grid, eventSys, CELL_SIZE, col, row) {
        destroyCell(grid, col, row);
        grid[row][col] = {
            type: "machine",
            ref: new Machine(svg, grid, eventSys, CELL_SIZE, {col, row}, false)
        };
    }

    function openCellAddClickHandle(svg, grid, eventSys, CELL_SIZE, col, row) {
        const cell = grid[row][col];
        /*
            type: "open",
            cost: costs[index],
            circle_ref: null,
            text_ref: null
        */
        cell.circle_ref.addEventListener("click", () => {   
            purchaseOpenCell(svg, grid, eventSys, CELL_SIZE, col, row);
        });
    }

    function createOpenCell(grid, CELL_SIZE, c, r) {
        let circle = createCircle(
            40 + CELL_SIZE * c,
            40 + CELL_SIZE * r,
            75/2 - 2 * 3 /* SIZE/2 - 2 * STROKE_WIDTH */
        );
        circle.setAttribute("class", "openCellCoin");
        let openText = makeText(
            CELL_SIZE,  
            40 + CELL_SIZE * c,
            40 + CELL_SIZE * r,
            decimalToHex(grid[r][c].cost), 
            "openCell");
        return {circle, openText};
    }

    function placeItems(svg, overlay, eventSys, ROWS, COLS, CELL_SIZE, grid) {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                switch(grid[r][c].type) {
                    case "number":
                        let text = makeText(
                            CELL_SIZE,  
                            40 + CELL_SIZE * c,
                            40 + CELL_SIZE * r,
                            decimalToHex(grid[r][c].value));
                        grid[r][c].ref = text;
                        overlay.appendChild(text);
                        break;
                    case "open":
                        let {circle, openText} = createOpenCell(grid, CELL_SIZE, c, r);
                        grid[r][c].circle_ref = circle;
                        grid[r][c].text_ref = openText;
                        svg.appendChild(circle);
                        overlay.appendChild(openText);
                        openCellAddClickHandle(svg, grid, eventSys, CELL_SIZE, c, r);
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

        // Event System
        let eventSys = new EventSystem(ROWS, COLS); 

        // Variables
        let grid = makeGrid(svg, eventSys, CELL_SIZE, ROWS, COLS);
        
        // Fill screen with SVG, and overlay
        container.style.width = `${WIDTH}px`;
        container.style.height = `${HEIGHT}px`;
        svg.setAttribute("width", WIDTH);
        svg.setAttribute("height", HEIGHT);
        
        // Place items in cells
        placeItems(svg, overlay, eventSys, ROWS, COLS, CELL_SIZE, grid);

    }

    main();

})();