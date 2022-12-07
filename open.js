function openCellPurchase({col, row}) {
    const state = readState();
    const grid = state.grid;
    const cell = grid[row][col];

    updateCoins(ELEMS, CONST, STATE, grid, CONST.CENTER, -1 * cell.value);
    destroy(grid, {col, row});
    grid[row][col] = newMachine(0);
    render(ELEMS, CONST, STATE, grid, {col, row});
    notifyAdjOfCellChange(CONST, grid, {col, row});
}

function openCellClick({col, row}) {
    const state = readState();
    const {CENTER} = state.const;
    const grid = state.grid;
    const cell = grid[row][col];

    cell.ref.circle.addEventListener("click", () => {
        const centerCoins = grid[CENTER.row][CENTER.col].value;
        if (cell.value <= centerCoins) {
            openCellPurchase(ELEMS, STATE, grid, CONST, {col, row});
        }
    });
}
function createOpenCell({col, row}) {
    const state = readState();
    const {CELL_SIZE} = state.const;
    const {grid, value_grid} = state;
    const value = value_grid[row][col];

    let circle = createCircle(
        CELL_SIZE/2 + CELL_SIZE * col,
        CELL_SIZE/2 + CELL_SIZE * row,
        75/2 - 2 * 3 /* SIZE/2 - 2 * STROKE_WIDTH */
    );
    circle.setAttribute("class", "openCellCoin");
    let text = makeText({col, row}, decimalToHex(value), "openCell");
    return {circle, text};
}

function initOpenInCell({col, row}) {
    const state = readState();
    const {overlay, svg} = state.ref;
    const grid = state.grid;
    const cell = grid[row][col]; 

    let {circle, text} = createOpenCell({col, row});
    cell.ref.circle = circle;
    cell.ref.text = text;
    svg.appendChild(circle);
    overlay.appendChild(text);
    openCellClick({col, row});
}