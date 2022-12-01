function decimalToHex(decimalNum) {
    let hexLookup = "0123456789ABCDEF";
    return hexLookup[decimalNum];
}

function makeText(CELL_SIZE, x, y, value, addClassName) {
    if (addClassName == undefined) {
        addClassName = "";
    }
    let text = document.createElement("div");
    text.style.top = `${y - CELL_SIZE/2}px`;
    text.style.left = `${x - CELL_SIZE/2}px`;
    text.style.width = `${CELL_SIZE}px`;
    text.style.height = `${CELL_SIZE}px`;
    text.textContent = value;
    text.className = `textContainer ${addClassName}`;
    return text;
}