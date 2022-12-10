function renderGlobalState() {
    
}

function renderGridAtCell({col, row}) {

} 

function render(pos) {
    if (pos == undefined) {
        renderGlobalState();
    } else {
        renderGridAtCell(pos);
    }
}

function changeState(newState) {
    state = {
        ...state,
        ...newState
    };
    render();
}

function cs(newState) {
    changeState(newState);
}

function changeState_Grid({col, row}, newState) {
    state.grid[row][col] = {
        ...state.grid[row][col],
        newState
    };
    render({col, row});
}

function cs_grid({col, row}, newState) {
    changeState_Grid({col, row}, newState);
}