# CoinCard

A simple game built with HTML and JS animated with CSS.

# Rules

- Player starts with one special "bank" machine in the center. This machine is originaly manual.

- Cells are Numbers, Open, or Machines.

- Open cells can be purchased at which time they become machines.

- Click the outer circles of a machine to "mine" manually.

- "mine" means reach to adj cells and pull as much values as possible such that mining machine does not excees 9 coins.

- Automine can be purchased and toggled by pressing the center of a machine to open a menu.

- Menu shows over top of lower right or left of the game grid depending on what machine is selected.

- Player can sell a machine for the original cost of purchasing the cell plus extra if they bought automine. The cell will become Open again in that case.

- Total money that player can spend is shown in the center of the bank machine.

- Total money can be raised by bringing coins to this machine or selling machines.

- If a machine is in auto mine state player must still pick a direction. The machine will automine in this direction until further mining would exceed the 9 coin limit or there are no coins left to mine in the adj cell.

- Click center of machine to show menu. Menu contains:
    - Purchase automine.
    - Toggle automine.
    - Sell machine.
    - Perhaps buy a single speed upgrade?

- CenterMachine differs from other machines only in that the middle can become a plus sign "+" when more than a value of "F" (16). 

# TODO

- [ ] When a cell becomes open, and calls notify, adj machines should hid related arm.
- [ ] When you click the center of a machine the menu should display.

# Bugs

- [ ] Machines can exist on the edge and mine off the board.
- [ ] Machines can exist next to open cells and mine into "unpurchased" open cells. 
- [ ] If a machine mines machine B, and B has zero coins, the cell becomes open. 
- [ ] If a machine removes last coin from another machine cell incorrectly becomes open.
- [ ] Clicking an open cell turns into a machine wihthout checking of decrementing coins.
- [ ] When an arm causes a cell to become open it should check for an open cell once it gets back because it may have to become hidden.
- [ ] Animation class on an arm should be removed when animation ends.
- [ ] When an Open Cell is purchased it should notify sourrounding cells.