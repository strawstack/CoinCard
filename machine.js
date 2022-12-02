function extractCoins(ELEMS, CONST, DATA, grid, {col, row}) {
    const cell = grid[row][col];
    let numCoins = cell.value;
    if (cell.type === "number") {
        numCoins = Math.min(numCoins, 1);
    }
    const coinSpace = DATA.MAX_COINS - cell.value;
    const removeCoins = Math.min(coinSpace, numCoins);
    updateCoins(ELEMS, CONST, grid, {col, row}, -1 * removeCoins);
    return removeCoins;
}

function coinArmClick(ELEMS, CONST, DATA, grid, direction, ref, {col, row}) {
    const offsetLookup = {
        "top": {col: 0, row: -1},
        "right": {col: 1, row: 0},
        "bottom": {col: 0, row: 1},
        "left": {col: -1, row: 0}
    };
    const classNameLookup = {
        "top": {out: "topArmOut", back: "topArmBack"},
        "right": {out: "rightArmOut", back: "rightArmBack"},
        "bottom": {out: "bottomArmOut", back: "bottomArmBack"},
        "left":{out: "leftArmOut", back: "leftArmBack"}
    };
    let offset = offsetLookup[direction];
    let className = classNameLookup[direction];

    let BASE_CLASS = "coinArm";
    ref.setAttribute("class", `${BASE_CLASS} ${className.out}`);
    
    setTimeout(() => {
        let coins = extractCoins(ELEMS, CONST, DATA, grid, add({col, row}, offset));

        let BASE_CLASS = "coinArm";
        ref.setAttribute("class", `${BASE_CLASS} ${className.back}`);
            
        if (coins > 0) {
            setTimeout(() => {
                updateCoins(ELEMS, CONST, grid, {col, row}, coins);
            }, 1000);
        } else {
            // TODO - enter the queue
        }
    }, 1000);
}

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

function createCoinStore(DATA, CELL_SIZE) {
    let text = makeText(
        CELL_SIZE, 
        DATA.CENTER.col, 
        DATA.CENTER.row - 1, 
        "0", "coinStore");
    return text;
}

function renderMachine(ELEMS, CONST, grid, {col, row}) {

    const cell = grid[row][col];

    const MAX_COINS = 15;
    const STROKE = 3;
    const RING_SIZE = 75 - 2 * STROKE;
    const ARM_SIZE = 25 - 2 * STROKE;
    const CENTER = {
        col: col * CONST.CELL_SIZE + CONST.CELL_SIZE/2, 
        row: row * CONST.CELL_SIZE + CONST.CELL_SIZE/2
    };
    const DATA = {MAX_COINS, STROKE, RING_SIZE, ARM_SIZE, CENTER};

    const group = createGroup(CENTER);

    const outerCircle = createOuterCircle(0, 0, RING_SIZE/2);

    cell.ref.arm.top    = createCoinArm(DATA, "top");
    cell.ref.arm.right  = createCoinArm(DATA, "right");
    cell.ref.arm.bottom = createCoinArm(DATA, "bottom");
    cell.ref.arm.left   =  createCoinArm(DATA, "left");

    cell.ref.arm.right.addEventListener("click", () => {
        coinArmClick(ELEMS, CONST, DATA, grid, "right", cell.ref.arm.right, {col, row});
    });

    ELEMS.svg.appendChild(group);
    group.appendChild(outerCircle);
    group.appendChild(cell.ref.arm.top);
    group.appendChild(cell.ref.arm.right);
    group.appendChild(cell.ref.arm.bottom);
    group.appendChild(cell.ref.arm.left);

    cell.ref.text = createCoinStore(DATA, CONST.CELL_SIZE);
    ELEMS.overlay.appendChild(cell.ref.text);
}