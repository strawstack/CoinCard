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
            ARM_SIZE: 19,
            MOVE_SPEED: 1000
        }
    },
    grid: [],
    value_grid: []
};

const MACHINE_STATE = {
    IDLE: 'IDLE',
    MOVING_TOP: 'MOVING_TOP',
    MOVING_RIGHT: 'MOVING_RIGHT',
    MOVING_BOTTOM: 'MOVING_BOTTOM',
    MOVING_LEFT: 'MOVING_LEFT'
};

const SHIFT_KEY_DOWN = false;

window.addEventListener("keydown", (e) => {
    if (e.key == "Shift") {
        SHIFT_KEY_DOWN = true;
    }
});

window.addEventListener("keyup", (e) => {
    if (e.key == "Shift") {
        SHIFT_KEY_DOWN = false;
    }
});

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
    const {COLS, ROWS, CENTER} = state.const;

    let value_grid = [];
    for (let r = 0; r < ROWS; r++) {
        let row = [];
        for (let c = 0; c < COLS; c++) {
            row.push( Math.floor(Math.random() * 15) + 1 );
        }
        value_grid.push(row);
    }

    let grid = [];
    for (let r = 0; r < ROWS; r++) {
        let row = [];
        for (let c = 0; c < COLS; c++) {
            let n = newNumber();
            n.value = value_grid[r][c];
            row.push(n);
        }
        grid.push(row);
    }

    // Add three open cells
    for (let i = 0; i < 3; i++) {
        let r = Math.floor(Math.random() * ROWS);
        let c = Math.floor(Math.random() * COLS);
        grid[r][c] = newOpenCell();
    }
    
    grid[CENTER.row][CENTER.col] = newMachine(0);

    // TODO - remove debug settings
    grid[CENTER.row][CENTER.col + 1].value = 1;
    grid[CENTER.row][CENTER.col].value = 100;

    return {grid, value_grid};
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
    const {grid, value_grid} = makeGrid();
    state.grid = grid;
    state.value_grid = value_grid;

    initHTML();
}

function readState() {
    // Could return a copy?
    return state;
}