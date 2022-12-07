const state = {
    data: {
        menu: {
            open: false,
            cell_pos: {
                row: null,
                col: null
            }
        },
        ref: {
            container: null,
            underlay: null,
            svg: null,
            overlay: null,
            menu: null
        },
        const: {
            CELL_SIZE: null,
            WIDTH: null,
            HEIGHT: null,
            ROWS: null,
            COLS: null,
            CENTER: {
                row: null,
                col: null
            }
        },
        machine: {
            MAX_COINS: null, 
            STROKE: null,
            RING_SIZE: null,
            ARM_SIZE: null,
            CENTER: null
        }
    },
    grid: [],
    value_grid: []
};

function initState() {

}

function readState() {
    // Could return a copy?
    return state;
}