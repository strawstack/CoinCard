function changeState_GridRefArm(property, {col, row}, value) {
    state.grid[row][col]["ref"]["arm"][property] = value;
}

function changeState_GridRef(property, {col, row}, value) {
    state.grid[row][col]["ref"][property] = value;
}

// value: The value to add to state
// route: The path in the state object
function changeState(value, ...route) {

}