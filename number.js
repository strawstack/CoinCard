function initNumberInCell({col, row}) {
    const state = readState();
    const {underlay} = state.ref;
    const grid = state.grid;
    
    let text = makeText({col, row}, decimalToHex(grid[row][col].value));
    grid[row][col].ref.text = text;
    underlay.appendChild(text);
}