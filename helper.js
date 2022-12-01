function p(text) {
    console.log(text);
}

function createGroup({col, row}) {
    const svgns = "http://www.w3.org/2000/svg";
    let g = document.createElementNS(svgns, "g");
    g.setAttribute("transform", `translate(${col}, ${row})`);
    return g;
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
            cell.ref.remove();
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

function render(ELEMS, CONST, grid, {col, row}) {
    const cell = grid[row][col];
    const renderLookup = {
        "machine": renderMachine,
        "number": renderNumber,
        "open": renderOpen
    };
    renderLookup[cell.type](ELEMS, CONST, grid, {col, row});
}