function renderNumber({underlay}, {CELL_SIZE}, grid, {col, row}) {
    let text = makeText(
        CELL_SIZE,  
        40 + CELL_SIZE * col,
        40 + CELL_SIZE * row,
        decimalToHex(grid[row][col].value));
    grid[row][col].ref.text = text;
    underlay.appendChild(text);
}