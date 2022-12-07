function changeState_SetMachineArmClassName({col, row}, dir, className, value) {
    state.grid[row][col]["classNames"]["arm"][dir][className] = value;
}

function changeState_MachineState({col, row}, newState) {
    state.grid[row][col]["state"] = newState;
}

function changeState_GridRefArm(property, {col, row}, value) {
    state.grid[row][col]["ref"]["arm"][property] = value;
}

function changeState_GridRef(property, {col, row}, value) {
    state.grid[row][col]["ref"][property] = value;
}