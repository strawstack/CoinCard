function p(text) {
    console.log(text);
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

function drawGridLines() {
    const state = readState(); 
    const svg = state.ref.svg;
    const {CELL_SIZE, WIDTH, HEIGHT, COLS, ROWS} = state.const; 

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

function getChangedCellDirection({notifiedCol, notifiedRow}, {col, row}) {
    const dcol = col - notifiedCol;
    const drow = row - notifiedRow;
    if (dcol == 0) {
        if (drow < 0) {
            return "top";
        } else { // drow > 0
            return "bottom";
        }
    } else { // drow == 0
        if (dcol < 0) {
            return "left";
        } else { // dcol > 0
            return "right";
        }
    }
}

function notifyCellChange(grid, {col: notifiedCol, row: notifiedRow}, {col, row}) {
    const notifiedCell = grid[notifiedRow][notifiedCol];
    const changedCell =  grid[row][col];
    const changedCellDir = getChangedCellDirection(
        {notifiedCol, notifiedRow},
        {col, row});
    if (notifiedCell.type == "machine" && changedCell.type == "open") {
        const arm = notifiedCell.ref.arm[changedCellDir];
        notifiedCell.data.auto.waiting.state = true;
        if (arm.className.baseVal.indexOf(changedCellDir) == -1) { // Arm not animating
            arm.setAttribute("class", `coinArm deactive`);
            notifiedCell.data.arm[changedCellDir].active = false;
        }
    } else if (notifiedCell.type == "machine" && changedCell.type == "machine") {
        const arm = notifiedCell.ref.arm[changedCellDir];
        arm.setAttribute("class", `coinArm`);
        notifiedCell.data.arm[changedCellDir].active = true;
        if (changedCell.value > 0) {
            notifiedCell.data.auto.waiting.state = false;
            notifiedCell.data.auto.waiting.callback();
        }
    }
}

function inBounds({ROWS, COLS}, {col, row}) {
    return col >= 0 && col < COLS && row >= 0 && row < ROWS;
}

function notifyAdjOfCellChange(CONST, grid, {col, row}) {
    const offset = [
        {col: 0, row: -1},
        {col: 1, row: 0},
        {col: 0, row: 1},
        {col: -1, row: 0}
    ];
    for (let delta of offset) {
        let otherCell = add({col, row}, delta);
        if (inBounds(CONST, otherCell)) {
            notifyCellChange(grid, otherCell, {col, row});
        }
    }
}

function updateCoins(ELEMS, CONST, STATE, grid, {col, row}, coinValue) {
    const cell = grid[row][col];
    cell.value += coinValue;
    cell.ref.text.textContent = decimalToHex(cell.value);
    if (cell.value == 0 && cell.type == "number") {
        destroy(grid, {col, row});
        grid[row][col] = newOpenCell();
        renderOpen(ELEMS, CONST, STATE, grid, {col, row});
    }
    notifyAdjOfCellChange(CONST, grid, {col, row});
}

function add(a, b) {
    return {
        col: a.col + b.col,
        row: a.row + b.row
    };
}

function createGroup({col, row}) {
    const svgns = "http://www.w3.org/2000/svg";
    let g = document.createElementNS(svgns, "g");
    g.setAttribute("transform", `translate(${col}, ${row})`);
    return g;
}

function newNumber() {
    return {
        type: "number",
        value: null,
        ref: {
            text: null
        }
    };
}

function newOpenCell() {
    return {
        type: "open",
        ref: {
            circle: null,
            text: null
        }
    };
}

function newMachine(value) {
    return {
        type: "machine",
        value: value,
        state: MACHINE_STATE.IDLE,
        data: {
            auto: {
                purchased: false,
                active: false,
                direction: "right"
            },
            arm: {
                top: {
                    active: true,
                    moving: false
                },
                right: {
                    active: true,
                    moving: false
                },
                bottom: {
                    active: true,
                    moving: false
                },
                left: {
                    active: true,
                    moving: false
                }
            }
        },
        classNames: {
            text: {},
            circle: {},
            arm: {
                top: {
                    coinArm: true,
                    topArmOut: false,
                    topArmBack: false
                },
                right: {
                    coinArm: true,
                    rightArmOut: false,
                    rightArmBack: false
                },
                bottom: {
                    coinArm: true,
                    bottomArmOut: false,
                    bottomArmBack: false
                },
                left: {
                    coinArm: true,
                    leftArmOut: false,
                    leftArmBack: false
                }
            }
        },
        ref: {
            text: null,
            circle: null,
            arm: {
                top: null,
                right: null,
                bottom: null,
                left: null
            }
        }
    }
}
function destroy({col, row}) {
    const state = readState();
    const grid = state.grid;
    const cell = grid[row][col];

    switch(cell.type) {
        case "number":
            cell.ref.text.remove();
            break;
        case "machine":
            cell.ref.text.remove();
            cell.ref.circle.remove();
            cell.ref.arm.top.remove();
            cell.ref.arm.right.remove();
            cell.ref.arm.bottom.remove();
            cell.ref.arm.left.remove();
            break;
        case "open":
            cell.ref.circle.remove();
            cell.ref.text.remove();
            break;
    }
}

function decimalToHex(decimalNum) {
    if (15 < decimalNum) { return "+"; }
    let hexLookup = "0123456789ABCDEF";
    return hexLookup[decimalNum];
}

function makeText({col, row}, value, addClassName) {
    const state = readState();
    const {CELL_SIZE} = state.const;
    
    if (addClassName == undefined) {
        addClassName = "";
    }
    let text = document.createElement("div");
    text.style.top = `${row * CELL_SIZE}px`;
    text.style.left = `${col * CELL_SIZE}px`;
    text.style.width = `${CELL_SIZE}px`;
    text.style.height = `${CELL_SIZE}px`;
    text.textContent = value;
    text.className = `textContainer ${addClassName}`;
    return text;
}

function getOffsetFromDir(dir) {
    const lookup = {
        "top": {col: 0, row: -1},
        "right": {col: 1, row: 0},
        "bottom": {col: 0, row: 1},
        "left": {col: -1, row: 0}
    };
    return lookup[dir];
}

function getAdjCell({col, row}, dir) {
    const state = readState();
    const grid = state.grid;

    const offset = getOffsetFromDir(dir);
    const {col: adjCol, row: adjRow} = add({col, row}, offset);
    return grid[adjRow][adjCol];
}

function getMovingState(dir) {
    const movingStateLookup = {
        "top": MACHINE_STATE.MOVING_TOP,
        "right": MACHINE_STATE.MOVING_RIGHT,
        "bottom": MACHINE_STATE.MOVING_BOTTOM,
        "left": MACHINE_STATE.MOVING_LEFT
    };
    return movingStateLookup[dir];
}

function applyClassNames(ref, classNamesObject) {
    const names = []; 
    for (let k in classNamesObject) {
        let flag = classNamesObject[k];
        if (flag) {
            names.push(k);
        }
    }
    ref.className = names.join(" ");
}

function applyClassNamesSVG(ref, classNamesObject) {
    const names = []; 
    for (let k in classNamesObject) {
        let flag = classNamesObject[k];
        if (flag) {
            names.push(k);
        }
    }
    ref.setAttribute("class", names.join(" "));
}

function getMovementClassNames(dir) {
    const classNameLookup = {
        "top": {outClass: "topArmOut", backClass: "topArmBack"},
        "right": {outClass: "rightArmOut", backClass: "rightArmBack"},
        "bottom": {outClass: "bottomArmOut", backClass: "bottomArmBack"},
        "left":{outClass: "leftArmOut", backClass: "leftArmBack"}
    };
    return classNameLookup[dir];
}