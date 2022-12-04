function openCellPurchase(ELEMS, STATE, grid, CONST, {col, row}) {
    destroy(grid, {col, row});
    grid[row][col] = newMachine(0);
    render(ELEMS, CONST, STATE, grid, {col, row});
    notifyAdjOfCellChange(CONST, grid, {col, row});
}
function openCellClick(ELEMS, STATE, grid, CONST, {col, row}) {
    const cell = grid[row][col];
    cell.ref.circle.addEventListener("click", () => {   
        openCellPurchase(ELEMS, STATE, grid, CONST, {col, row});
    });
}
function createOpenCell(CELL_SIZE, grid, {col, row}) {
    let circle = createCircle(
        CELL_SIZE/2 + CELL_SIZE * col,
        CELL_SIZE/2 + CELL_SIZE * row,
        75/2 - 2 * 3 /* SIZE/2 - 2 * STROKE_WIDTH */
    );
    circle.setAttribute("class", "openCellCoin");
    let text = makeText(
        CELL_SIZE,  
        CELL_SIZE/2 + CELL_SIZE * col,
        CELL_SIZE/2 + CELL_SIZE * row,
        decimalToHex(grid[row][col].value), 
        "openCell");
    return {circle, text};
}
function renderOpen(ELEMS, CONST, STATE, grid, {col, row}) {
    let {circle, text} = createOpenCell(CONST.CELL_SIZE, grid, {col, row});
    grid[row][col].ref.circle = circle;
    grid[row][col].ref.text = text;
    ELEMS.svg.appendChild(circle);
    ELEMS.overlay.appendChild(text);
    openCellClick(ELEMS, STATE, grid, CONST, {col, row});
}