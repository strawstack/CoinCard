(() => {

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

    function makeGrid(WIDTH, HEIGHT, ROWS, COLS) {
        let grid = [];

        /* A cell can have the following states:
         *  Number: contains a number 0 to 9.
         *  Machine: contains a machine.
         *  Open: the player can buy the cell at which time it will become a machine.
         */

        
    }

    function main() {

        // Constants
        const CELL_SIZE = 80;
        const { WIDTH, HEIGHT, ROWS, COLS } = getDocumentBodySizeAsMultipleOf(CELL_SIZE);

        // Elements
        const svg = document.querySelector("svg");

        // Variables
        let grid = makeGrid(WIDTH, HEIGHT, ROWS, COLS);
        
        // Set SVG to fill screen
        svg.setAttribute("width", WIDTH);
        svg.setAttribute("height", HEIGHT);

        // Draw grid lines
        drawGridLines(svg, CELL_SIZE, WIDTH, HEIGHT, COLS, ROWS);

        p(grid)

    }

    main();

})();