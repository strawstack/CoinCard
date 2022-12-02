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
    const cell = grid[row][col];
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
        const targetCellPos = add({col, row}, offset);
        const {col: tcol, row: trow} = targetCellPos;
        let coins = extractCoins(ELEMS, CONST, DATA, grid, targetCellPos);
        let BASE_CLASS = "coinArm";
        let isFilled = (coins > 0) ? "filled" : "";
        ref.setAttribute("class", `${BASE_CLASS} ${className.back} ${isFilled}`);

        setTimeout(() => {
            updateCoins(ELEMS, CONST, grid, {col, row}, coins);
            const targetCell = grid[trow][tcol];
            let isActiveClass = (targetCell.type == "open") ? "deactive" : "";
            ref.setAttribute("class", `${BASE_CLASS} ${isActiveClass}`);
            cell.data.arm[direction].active = targetCell.type != "open";
            cell.data.arm[direction].moving = false;
        }, 1000);

        if (coins == 0) {
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
    cell.ref.circle = outerCircle;

    cell.ref.arm.top    = createCoinArm(DATA, "top");
    cell.ref.arm.right  = createCoinArm(DATA, "right");
    cell.ref.arm.bottom = createCoinArm(DATA, "bottom");
    cell.ref.arm.left   =  createCoinArm(DATA, "left");

    cell.ref.arm.top.addEventListener("click", () => {
        if (!cell.data.arm.top.active || cell.data.arm.top.moving) return;
        cell.data.arm.top.moving = true;
        coinArmClick(ELEMS, CONST, DATA, grid, "top", cell.ref.arm.top, {col, row});
    });
    cell.ref.arm.right.addEventListener("click", () => {
        if (!cell.data.arm.right.active || cell.data.arm.right.moving) return;
        cell.data.arm.right.moving = true;
        coinArmClick(ELEMS, CONST, DATA, grid, "right", cell.ref.arm.right, {col, row});
    });
    cell.ref.arm.bottom.addEventListener("click", () => {
        if (!cell.data.arm.bottom.active || cell.data.arm.bottom.moving) return;
        cell.data.arm.bottom.moving = true;
        coinArmClick(ELEMS, CONST, DATA, grid, "bottom", cell.ref.arm.bottom, {col, row});
    });
    cell.ref.arm.left.addEventListener("click", () => {
        if (!cell.data.arm.left.active || cell.data.arm.left.moving) return;
        cell.data.arm.left.moving = true;
        coinArmClick(ELEMS, CONST, DATA, grid, "left", cell.ref.arm.left, {col, row});
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