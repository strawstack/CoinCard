function p(text) {
    console.log(text);
}

function updateCoins(ELEMS, CONST, grid, {col, row}, coinValue) {
    const cell = grid[row][col];
    cell.value += coinValue;
    if (cell.value > 0) {
        cell.ref.text.textContent = decimalToHex(cell.value);
    } else {
        // Replace with open cell
        destroy(grid, {col, row});
        grid[row][col] = newOpenCell();
        renderOpen(ELEMS, CONST, grid, {col, row});
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

function render(ELEMS, CONST, grid, {col, row}) {
    const cell = grid[row][col];
    const renderLookup = {
        "machine": renderMachine,
        "number": renderNumber,
        "open": renderOpen
    };
    renderLookup[cell.type](ELEMS, CONST, grid, {col, row});
}