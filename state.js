const state = {
    menu: {
        open: false,
        cell_pos: {
            row: null,
            col: null
        }
    },
    ref: {
        container: null,
        underlay: null,
        svg: null,
        overlay: null,
        menu: null
    },
    const: {
        CELL_SIZE: null,
        WIDTH: null,
        HEIGHT: null,
        ROWS: null,
        COLS: null,
        CENTER: {
            row: null,
            col: null
        },
        MACHINE: {
            MAX_COINS: 15, 
            STROKE: 3,
            RING_SIZE: 69,
            ARM_SIZE: 19
        }
    },
    grid: [],
    value_grid: []
};

function initCell({col, row}) {
    const state = readState();
    const grid = state.grid;
    const cell = grid[row][col];

    const renderLookup = {
        "machine": () => initMachineInCell({col, row}),
        "number": () => initNumberInCell({col, row}),
        "open": () => initOpenInCell({col, row})
    };
    renderLookup[cell.type]();
}

function initHTML() {
    const state = readState();
    const {container, svg} = state.ref;
    const {WIDTH, HEIGHT, ROWS, COLS} = state.const;
    
    // Set container and SVG size to match screen
    container.style.width = `${WIDTH}px`;
    container.style.height = `${HEIGHT}px`;
    svg.setAttribute("width", WIDTH);
    svg.setAttribute("height", HEIGHT);
    
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            initCell({col, row});
        }
    }
}

function makeGrid() {
    const state = readState();
    const {COLS, ROWS} = state.const;

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
    
    grid[CENTER_ROW][CENTER_COL] = newMachine(0);

    // TODO - remove debug settings
    grid[CENTER_ROW][CENTER_COL + 1].value = 1;
    grid[CENTER_ROW][CENTER_COL].value = 100;

    return grid;
}

function initState() {
    const container = document.querySelector(".container");
    const underlay = document.querySelector(".underlay");
    const svg = document.querySelector("svg");
    const overlay = document.querySelector(".overlay");
    const menu = document.querySelector(".menu");

    state.ref.container = container;
    state.ref.underlay = underlay;
    state.ref.svg = svg;
    state.ref.overlay = overlay;
    state.ref.menu = menu;

    const CELL_SIZE = 80;
    const { WIDTH, HEIGHT, ROWS, COLS } = getDocumentBodySizeAsMultipleOf(CELL_SIZE);
    const CENTER = {
        col: Math.floor(COLS/2), 
        row: Math.floor(ROWS/2)
    };
    
    state.const.CELL_SIZE = CELL_SIZE;
    state.const.WIDTH = WIDTH;
    state.const.HEIGHT = HEIGHT;
    state.const.ROWS = ROWS;
    state.const.COLS = COLS;
    state.const.CENTER = CENTER;

    drawGridLines();
    const grid = makeGrid();
    state.grid = grid;

    initHTML();
}

function readState() {
    // Could return a copy?
    return state;
}