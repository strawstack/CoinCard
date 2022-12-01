function createOuterCircle(cx, cy, r) {
    let outerCircle = createCircle(cx, cy, r);
    outerCircle.setAttribute("class", "outerCircle");
    return outerCircle;
}

function createCoinArm({RING_SIZE, ARM_SIZE}, dir) {
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

function renderMachine(ELEMS, CONST, grid, {col, row}) {

    const cell = grid[row][col];

    const MAX_COINS = 15;
    const STROKE = 3;
    const RING_SIZE = 75 - 2 * STROKE;
    const ARM_SIZE = 25 - 2 * STROKE;
    const DATA = {MAX_COINS, STROKE, RING_SIZE, ARM_SIZE};
    const CENTER = {
        col: col * CONST.CELL_SIZE + CONST.CELL_SIZE/2, 
        row: row * CONST.CELL_SIZE + CONST.CELL_SIZE/2
    };

    const group = createGroup(CENTER);

    const outerCircle = createOuterCircle(0, 0, RING_SIZE/2);

    cell.ref.arm.top    = createCoinArm(DATA, "top");
    cell.ref.arm.right  = createCoinArm(DATA, "right");
    cell.ref.arm.bottom = createCoinArm(DATA, "bottom");
    cell.ref.arm.left   =  createCoinArm(DATA, "left");

    // TODO - Handle click on coinArms

    ELEMS.svg.appendChild(group);
    group.appendChild(outerCircle);
    group.appendChild(cell.ref.arm.top);
    group.appendChild(cell.ref.arm.right);
    group.appendChild(cell.ref.arm.bottom);
    group.appendChild(cell.ref.arm.left);
}