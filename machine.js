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

function coinArmClick({col, row}, dir) {
    const state = readState();
    const grid = state.grid;
    const cell = grid[row][col];

    const offset = getOffsetFromDir(dir);
    const classNameLookup = {
        "top": {out: "topArmOut", back: "topArmBack"},
        "right": {out: "rightArmOut", back: "rightArmBack"},
        "bottom": {out: "bottomArmOut", back: "bottomArmBack"},
        "left":{out: "leftArmOut", back: "leftArmBack"}
    };
}

function createCoinArm(dir) {
    const state = readState();
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
    coinArm.setAttribute("class", "coinArm");
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
    const armTop = createCoinArm("top");
    const armRight = createCoinArm("right");
    const armBottom = createCoinArm("bottom");
    const armLeft = createCoinArm("left");

    outerCircle.addEventListener("click", () => {
        p("click: outerCircle")
    });
    armTop.addEventListener("click", () => {
        p("click: armTop")
    });
    armRight.addEventListener("click", (e) => {
        p("click: armRight")
    });
    armBottom.addEventListener("click", () => {
        p("click: armBottom")
    });
    armLeft.addEventListener("click", () => {
        p("click: armLeft")
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