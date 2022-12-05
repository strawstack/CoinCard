function clickedCellOwnsMenu(STATE, {col, row}) {
    return STATE.menu.open && 
        STATE.menu.cell_pos.row == row && 
        STATE.menu.cell_pos.col == col;
}

function anyArmMoving(cell) {
    let dir = ["top", "right", "bottom", "left"];
    for (let d of dir) {
        if (cell.data.arm[d].moving) {
            return true;
        }
    }
    return false;
}

// NOTE: Don't remove. Adds menu click to global name space for help with later removal
function menuBuyButtonClick() {}
function menuSwitchClick() {}
function menuAutoButtonClick() {}

function openMenu(ELEMS, CONST, STATE, DATA, grid, {col, row}) {
    const cell = grid[row][col];
    const menuRef = ELEMS.menu;
    const menuState = STATE.menu;

    if (cell.data.auto.purchased) {
        menuRef.querySelector(".purchased").style.display = "grid";
        menuRef.querySelector(".unpurchased").style.display = "none";
        let a = cell.data.auto.active;
        menuRef.querySelector(".switch").textContent = (a) ? "on" : "off";
    } else {
        menuRef.querySelector(".purchased").style.display = "none";
        menuRef.querySelector(".unpurchased").style.display = "grid";
    }

    // ADD: menu Click listeners
    menuBuyButtonClick = () => {
        cell.data.auto.purchased = true;
        closeMenu(ELEMS, STATE);
        openMenu(ELEMS, CONST, STATE, DATA, grid, {col, row});
    };
    menuRef.querySelector(".buyButton").addEventListener("click", menuBuyButtonClick);
    
    menuSwitchClick = () => {
        cell.data.auto.active = !cell.data.auto.active;
        let a = cell.data.auto.active;
        menuRef.querySelector(".switch").textContent = (a) ? "on" : "off";
        if (a && !anyArmMoving(cell)) {
            const cell = grid[row][col];
            const direction = cell.data.auto.direction;
            coinArmClick(ELEMS, CONST, STATE, DATA,
                grid, direction, cell.ref.arm[direction], {col, row});
        }
    };
    menuRef.querySelector(".switch").addEventListener("click", menuSwitchClick);

    // Highlight current direction
    const buttonLookup = {
        "top": 0,
        "right": 2,
        "bottom": 3,
        "left": 1
    };
    let buttonIndex = buttonLookup[cell.data.auto.direction];
    const buttonList = menuRef.querySelectorAll(`.button`);
    buttonList[buttonIndex].className = "button selected";
    menuAutoButtonClick = (e) => {
        for (let button of buttonList) {
            button.className = "button";
        }
        cell.data.auto.direction = e.target.dataset.direction;
        buttonIndex = buttonLookup[cell.data.auto.direction];
        buttonList[buttonIndex].className = "button selected";
        cell.data.auto.waiting.state = false;
        cell.data.auto.waiting.callback = () => {
            coinArmClick(ELEMS, CONST, STATE, DATA, 
                grid, cell.data.auto.direction, 
                cell.ref.arm[cell.data.auto.direction], {col, row});
        };
    };
    for (let button of buttonList) {
        button.addEventListener("click", menuAutoButtonClick);
    }

    menuRef.style.display = "inline-block";
    menuState.open = true;
    menuState.cell_pos = {col, row};
}

function closeMenu({ menu: menuRef }, { menu: menuState }) {
    menuRef.style.display = "none";
    menuState.open = false;
    menuState.cell_pos = null;

    // REMOVE: menu Click listeners
    menuRef.querySelector(".buyButton").removeEventListener("click", menuBuyButtonClick);
    menuRef.querySelector(".switch").removeEventListener("click", menuSwitchClick);
    const buttonList = menuRef.querySelectorAll(`.button`);
    for (let button of buttonList) {
        button.className = "button";
        button.removeEventListener("click", menuAutoButtonClick);
    }
}

function toggleMenu(ELEMS, CONST, STATE, DATA, grid, {col, row}) {
    if (!STATE.menu.open) { // menu not open, then open
        openMenu(ELEMS, CONST, STATE, DATA, grid, {col, row});

    // Open and owned then close
    } else if (clickedCellOwnsMenu(STATE, {col, row})) {
        closeMenu(ELEMS, STATE);

    } else { // Open, but not owned, switch menu
        closeMenu(ELEMS, STATE);
        openMenu(ELEMS, CONST, STATE, DATA, grid, {col, row});
    }
}

function extractCoins(ELEMS, CONST, STATE, DATA, grid, 
    {col, row}, {col: reqCol, row: reqRow}) {
    const cell = grid[row][col];
    const reqCell = grid[reqRow][reqCol];
    let numCoins = cell.value;
    if (cell.type === "number") {
        numCoins = Math.min(numCoins, 1);
    }
    let coinSpace = DATA.MAX_COINS - reqCell.value;
    if (reqCol == CONST.CENTER.col && reqRow == CONST.CENTER.row) {
        coinSpace = Infinity;
    }
    const removeCoins = Math.min(coinSpace, numCoins);
    updateCoins(ELEMS, CONST, STATE, grid, {col, row}, -1 * removeCoins);
    return removeCoins;
}

function coinArmClick(ELEMS, CONST, STATE, DATA, grid, direction, ref, {col, row}) {
    const cell = grid[row][col];
    otherArmsDeactive(cell, direction);
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
        let coins = extractCoins(ELEMS, CONST, STATE, DATA, grid, 
            targetCellPos, {col, row}
        );
        let BASE_CLASS = "coinArm";
        let isFilled = (coins > 0) ? "filled" : "";
        ref.setAttribute("class", `${BASE_CLASS} ${className.back} ${isFilled}`);

        setTimeout(() => {
            updateCoins(ELEMS, CONST, STATE, grid, {col, row}, coins);
            if (coins == 0) {
                cell.data.auto.waiting.state = true;
            }
            const targetCell = grid[trow][tcol];
            let isActiveClass = (targetCell.type == "open") ? "deactive" : "";
            ref.setAttribute("class", `${BASE_CLASS} ${isActiveClass}`);
            cell.data.arm[direction].active = targetCell.type != "open";
            cell.data.arm[direction].moving = false;
            armsActive(cell);
            resetArms(CONST, grid, {col, row});
            if (cell.data.auto.active && !cell.data.auto.waiting.state) {
                coinArmClick(ELEMS, CONST, STATE, DATA, 
                    grid, cell.data.auto.direction, 
                    cell.ref.arm[cell.data.auto.direction], {col, row});
            }
        }, 1000);
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

function otherArmsDeactive(cell, activeArm) {
    const arms = ["top", "right", "bottom", "left"];
    for (let armName of arms) {
        if (armName != activeArm) {
            cell.data.arm[armName].active = false;
            cell.ref.arm[armName].setAttribute("class", "coinArm deactive");
        }
    }
}

function armsActive(cell) {
    const arms = ["top", "right", "bottom", "left"];
    for (let armName of arms) {
        cell.data.arm[armName].active = true;
        cell.ref.arm[armName].setAttribute("class", "coinArm");
    }
}

function resetArms(CONST, grid, {col, row}) {
    const cell = grid[row][col];
    const adj = [
        {col: 0, row: -1, otherArmName: "top"},
        {col: 1, row: 0, otherArmName: "right"},
        {col: 0, row: 1, otherArmName: "bottom"},
        {col: -1, row: 0, otherArmName: "left"}
    ];
    for (let d of adj) {
        let tCellPos = add({col, row}, d);
        if (!inBounds(CONST, tCellPos) || 
        grid[tCellPos.row][tCellPos.col].type == "open") {
            cell.data.arm[d.otherArmName].active = false;
            cell.ref.arm[d.otherArmName].setAttribute("class", "coinArm deactive");
        }
    }
}

function renderMachine(ELEMS, CONST, STATE, grid, {col, row}) {

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

    cell.ref.circle.addEventListener("click", () => {
        toggleMenu(ELEMS, CONST, STATE, DATA, grid, {col, row});
    });

    cell.ref.arm.top    = createCoinArm(DATA, "top");
    cell.ref.arm.right  = createCoinArm(DATA, "right");
    cell.ref.arm.bottom = createCoinArm(DATA, "bottom");
    cell.ref.arm.left   = createCoinArm(DATA, "left");

    resetArms(CONST, grid, {col, row});

    // Default waiting state callback
    cell.data.auto.waiting.callback = () => {
        coinArmClick(ELEMS, CONST, STATE, DATA, 
            grid, cell.data.auto.direction, 
            cell.ref.arm[cell.data.auto.direction], {col, row});
    };
    
    cell.ref.arm.top.addEventListener("click", () => {
        if (!cell.data.arm.top.active || 
            cell.data.arm.top.moving || 
            cell.data.auto.active) return;
        cell.data.arm.top.moving = true;
        coinArmClick(ELEMS, CONST, STATE, DATA, 
            grid, "top", cell.ref.arm.top, {col, row});
    });
    cell.ref.arm.right.addEventListener("click", (e) => {
        if (!cell.data.arm.right.active || 
            cell.data.arm.right.moving || 
            cell.data.auto.active) return;
        cell.data.arm.right.moving = true;
        coinArmClick(ELEMS, CONST, STATE, DATA, 
            grid, "right", cell.ref.arm.right, {col, row});
    });
    cell.ref.arm.bottom.addEventListener("click", () => {
        if (!cell.data.arm.bottom.active || 
            cell.data.arm.bottom.moving || 
            cell.data.auto.active) return;
        cell.data.arm.bottom.moving = true;
        coinArmClick(ELEMS, CONST, STATE, DATA, 
            grid, "bottom", cell.ref.arm.bottom, {col, row});
    });
    cell.ref.arm.left.addEventListener("click", () => {
        if (!cell.data.arm.left.active || 
            cell.data.arm.left.moving || 
            cell.data.auto.active) return;
        cell.data.arm.left.moving = true;
        coinArmClick(ELEMS, CONST, STATE, DATA, 
            grid, "left", cell.ref.arm.left, {col, row});
    });

    ELEMS.svg.appendChild(group);
    group.appendChild(cell.ref.circle);
    group.appendChild(cell.ref.arm.top);
    group.appendChild(cell.ref.arm.right);
    group.appendChild(cell.ref.arm.bottom);
    group.appendChild(cell.ref.arm.left);

    cell.ref.text = createCoinStore(DATA, CONST.CELL_SIZE);
    ELEMS.overlay.appendChild(cell.ref.text);
}