function p(text) {
    console.log(text);
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
        if (arm.className.baseVal.indexOf(changedCellDir) == -1) { // Arm not animating
            arm.setAttribute("class", `coinArm deactive`);
            notifiedCell.data.arm[changedCellDir].active = false;
        }
    } else if (notifiedCell.type == "machine" && changedCell.type == "machine") {
        const arm = notifiedCell.ref.arm[changedCellDir];
        arm.setAttribute("class", `coinArm`);
        notifiedCell.data.arm[changedCellDir].active = true;
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
        notifyAdjOfCellChange(CONST, grid, {col, row});
    }
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
        value: (Math.floor(Math.random() * 15) + 1), // 1 to 9
        ref: {
            text: null
        }
    };
}

function newOpenCell() {
    let index = Math.floor(Math.random() * 3);
    let costs = [1, 3, 5];
    return {
        type: "open",
        value: costs[index],
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
        data: {
            hasAuto: false,
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
function destroy(grid, {col, row}) {
    const cell = grid[row][col];
    switch(cell.type) {
        case "number":
            cell.ref.text.remove();
            break;
        case "machine":
            p(cell)
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

function makeLine(x1, y1, x2, y2) {
    const svgns = "http://www.w3.org/2000/svg";
    let line = document.createElementNS(svgns, "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    return line;
}

function createCircle(cx, cy, r) {
    const svgns = "http://www.w3.org/2000/svg";
    let circle = document.createElementNS(svgns, "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", r);
    return circle;
}

function decimalToHex(decimalNum) {
    if (15 < decimalNum) {
        return "+";
    }
    let hexLookup = "0123456789ABCDEF";
    return hexLookup[decimalNum];
}

function makeText(CELL_SIZE, col, row, value, addClassName) {
    if (addClassName == undefined) {
        addClassName = "";
    }
    let text = document.createElement("div");
    text.style.top = `${row - CELL_SIZE/2}px`;
    text.style.left = `${col - CELL_SIZE/2}px`;
    text.style.width = `${CELL_SIZE}px`;
    text.style.height = `${CELL_SIZE}px`;
    text.textContent = value;
    text.className = `textContainer ${addClassName}`;
    return text;
}

function render(ELEMS, CONST, STATE, grid, {col, row}) {
    const cell = grid[row][col];
    const renderLookup = {
        "machine": () => renderMachine(ELEMS, CONST, STATE, grid, {col, row}),
        "number": () => renderNumber(ELEMS, CONST, grid, {col, row}),
        "open": () => renderOpen(ELEMS, CONST, STATE, grid, {col, row})
    };
    renderLookup[cell.type]();
}