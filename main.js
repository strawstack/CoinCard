(() => {

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

    function drawGridLines({svg}, {CELL_SIZE, WIDTH, HEIGHT, COLS, ROWS}) {
        
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

    function makeGrid(ROWS, COLS) {
        let grid = [];

        for (let r = 0; r < ROWS; r++) {
            let row = [];
            for (let c = 0; c < COLS; c++) {
                row.push(newNumber());
            }
            grid.push(row);
        }

        // Add three open cells
        for (let i = 0; i < 3; i++) {
            let r = Math.floor(Math.random() * ROWS);
            let c = Math.floor(Math.random() * COLS);
            grid[r][c] = newOpenCell();
        }

        // Create and place center machine
        const CENTER_ROW = Math.floor(ROWS/2);
        const CENTER_COL = Math.floor(COLS/2);

        // TODO - remove debug settings
        grid[CENTER_ROW][CENTER_COL + 1].value = 1;
        
        grid[CENTER_ROW][CENTER_COL] = newMachine(0);

        return grid;
    }

    function main() {

        // Elements
        const container = document.querySelector(".container");
        const underlay = document.querySelector(".underlay");
        const svg = document.querySelector("svg");
        const overlay = document.querySelector(".overlay");
        const menu = document.querySelector(".menu");
        const ELEMS = {container, underlay, svg, overlay, menu};
        const STATE = {
            menu: {
                open: false,
                cell_pos: null
            }
        };

        // Constants
        const CELL_SIZE = 80;
        const { WIDTH, HEIGHT, ROWS, COLS } = getDocumentBodySizeAsMultipleOf(CELL_SIZE);
        const CENTER = {
            col: Math.floor(COLS/2), 
            row: Math.floor(ROWS/2)
        };
        const CONST = { CELL_SIZE, WIDTH, HEIGHT, ROWS, COLS, CENTER };

        // Draw grid lines
        drawGridLines(ELEMS, CONST);

        // Variables
        let grid = makeGrid(ROWS, COLS);
        
        // Fill screen with SVG, and overlay
        container.style.width = `${WIDTH}px`;
        container.style.height = `${HEIGHT}px`;
        svg.setAttribute("width", WIDTH);
        svg.setAttribute("height", HEIGHT);
        
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                render(ELEMS, CONST, STATE, grid, {col, row});
            }
        }

        grid[CENTER.row][CENTER.col].ref.circle.setAttribute("class", "outerCircle centerMachine");

        // Handle click for menu close
        document.querySelector(".menu .close").addEventListener("click", () => {
            closeMenu(ELEMS, STATE);
        });
    }

    main();

})();