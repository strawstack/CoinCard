function clickedCellOwnsMenu(STATE, {col, row}) {
    return STATE.menu.open && 
        STATE.menu.cell_pos.row == row && 
        STATE.menu.cell_pos.col == col;
}

function openMenu({col, row}) {

}

function closeMenu() {

}

function toggleMenu({col, row}) {
    if (!STATE.menu.open) { // menu not open, then open
        openMenu({col, row});

    // Open and owned then close
    } else if (clickedCellOwnsMenu({col, row})) {
        closeMenu();

    } else { // Open, but not owned, switch menu
        closeMenu();
        openMenu({col, row});
    }
}

function coinArmShiftClick({col, row}, dir) {

}

function coinArmClick({col, row}, dir) {
    const state = readState();
    const grid = state.grid;
    const {MOVE_SPEED} = state.const.MACHINE;
    const cell = grid[row][col];
    const arm = cell.ref.arm[dir];

    if (SHIFT_KEY_DOWN) {
        coinArmShiftClick({col, row}, dir);
        
    } else if (cell.state == MACHINE_STATE.IDLE) {
        changeState_MachineState({col, row}, getMovingState(dir));
        
        const {outClass, backClass} = getMovementClassNames(dir);
        changeState_SetMachineArmClassName({col, row}, dir, outClass, true);
        changeState_SetMachineArmClassName({col, row}, dir, backClass, false);
        applyClassNamesSVG(arm, cell.classNames.arm[dir]);

        setTimeout(() => {

            // TODO Extract value from cell
            const adjCell = getAdjCell({col, row}, dir);

            changeState_SetMachineArmClassName({col, row}, dir, outClass, false);
            changeState_SetMachineArmClassName({col, row}, dir, backClass, true);
            applyClassNamesSVG(arm, cell.classNames.arm[dir]);
            
            setTimeout(() => {

                // TODO Deliver value
                // TODO check auto active and maybe launch again

                changeState_SetMachineArmClassName({col, row}, dir, outClass, false);
                changeState_SetMachineArmClassName({col, row}, dir, backClass, false);
                applyClassNamesSVG(arm, cell.classNames.arm[dir]);
                changeState_MachineState({col, row}, MACHINE_STATE.IDLE);

            }, MOVE_SPEED);
        }, MOVE_SPEED);
    }
}

function createCoinArm({col, row}, dir) {
    const state = readState();
    const grid = state.grid; 
    const classNamesObject = grid[row][col].classNames.arm[dir];
    const {RING_SIZE, ARM_SIZE} = state.const.MACHINE;

    let size2 = RING_SIZE/2;
    let arm_size2 = ARM_SIZE/2;
    let pad = 3;
    let lookup = {
        "top": {cx: 0, cy: -size2 + arm_size2 + pad},
        "right": {cx: size2 - arm_size2 - pad, cy: 0},
        "bottom": {cx: 0, cy: size2 - arm_size2 - pad},
        "left": {cx: -size2 + arm_size2 + pad, cy: 0}
    };
    let {cx, cy} = lookup[dir];
    let coinArm = createCircle(cx, cy, arm_size2);
    applyClassNamesSVG(coinArm, classNamesObject);
    return coinArm;
}

function createCoinStore({col, row}) {
    let text = makeText({col, row}, "0", "coinStore");
    return text;
}

function createOuterCircle(cx, cy, r) {
    let outerCircle = createCircle(cx, cy, r);
    outerCircle.setAttribute("class", "outerCircle");
    return outerCircle;
}

function initMachineInCell({col, row}) {
    const state = readState();
    const {overlay, svg} = state.ref;
    const {CELL_SIZE} = state.const;
    const {RING_SIZE} = state.const.MACHINE;

    const CENTER = {
        col: col * CELL_SIZE + CELL_SIZE/2, 
        row: row * CELL_SIZE + CELL_SIZE/2
    };

    const group = createGroup(CENTER);
    const outerCircle = createOuterCircle(0, 0, RING_SIZE/2);
    const text = createCoinStore({col, row});
    const armTop = createCoinArm({col, row}, "top");
    const armRight = createCoinArm({col, row}, "right");
    const armBottom = createCoinArm({col, row}, "bottom");
    const armLeft = createCoinArm({col, row}, "left");

    outerCircle.addEventListener("click", () => {
        p("click: outerCircle")
    });
    armTop.addEventListener("click", () => {
        p("click: armTop")
        coinArmClick({col, row}, "top");
    });
    armRight.addEventListener("click", (e) => {
        p("click: armRight")
        coinArmClick({col, row}, "right");
    });
    armBottom.addEventListener("click", () => {
        p("click: armBottom")
        coinArmClick({col, row}, "bottom");
    });
    armLeft.addEventListener("click", () => {
        p("click: armLeft")
        coinArmClick({col, row}, "left");
    });

    svg.appendChild(group);
    group.appendChild(outerCircle);
    group.appendChild(armTop);
    group.appendChild(armRight);
    group.appendChild(armBottom);
    group.appendChild(armLeft);
    overlay.appendChild(text);

    changeState_GridRef("circle", {col, row}, outerCircle);
    changeState_GridRef("text", {col, row}, text);
    changeState_GridRefArm("top", {col, row}, armTop);
    changeState_GridRefArm("right", {col, row}, armRight);
    changeState_GridRefArm("bottom", {col, row}, armBottom);
    changeState_GridRefArm("left", {col, row}, armLeft);
}