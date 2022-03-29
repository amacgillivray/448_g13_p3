# 448_g13_p3
**EECS 448, Group 13, Project 3**

![demo-2r](https://user-images.githubusercontent.com/40438470/160699786-9af2a8b4-62f1-4ea7-ab64-c57cb734e1af.png)


This project shows the prototype of a "milsim" style strategy game, where 2 players compete for control over a region.

## Game Rules: 

### Regions & Terrain
The map is broken into several regions, each of which has specific terrain that effects the movement speed and combat effectiveness of different troop types.
The following terrain types exist:
 * Hills
 * Plains / Prarie
 * Forest
 * River
 * Urban (Dense) 
 * Urban (Sparse)

Each cell is given an array of these terrain types, each with a weight, such that the total weight of terrain amounts to 1. 
During combat, the total bonuses and debuffs are multiplied by the terrain's weight in the cell, then applied to the affected unit types on both sides. *(Defender may get 50%-weight debuffs to create an advantage)*

### Units

#### Allocation
Each player starts the game with a predetermined allocation of infantry, armor, and helicopters. These will be automatically placed at standard positions at the beginning of the game.

#### Unit Sizes

```
Sym   Name                     Numbers
X   - Brigade                - 2000 to 5000
III - Regiment               - 1000 to 2000
II  - Battalion              - 250  to 1000
I   - Company                - 40   to 250
••• - Platoon                - 13   to 40
••  - Section                - 7    to 13
•   - Patrol                 - 5    to 10
Ø   - Fireteam               - 3    to 5
ø   - Fire and Maneuver Team - 1    to 2
```

#### Movement
During a turn, the player can command their units to traverse from the current cell to any adjacent cell. Once submitted, the command will be followed and the troops will move over one or more turns (as determined by movement speed modifiers).
All troops of a given type will move together, but units of the same type can be split and sent to two separate cells.

#### Countering
The game's three units have a rock-paper-scissors countering system:
 * Infantry beats Helicopter
 * Helicopter beats Armor
 * Armor beats Infantry

Each counter yields a specific damage modifier for the superior unit against its inferior match.
Damage is dealt using a base damage number for the unit type, multiplied by the unit count, and then adjusted for terrain modifiers and the countering system. 

#### Modifiers
See Regions & Terrain

### Fog of War
It is assumed that both sides are equipped with satellite ISR capabilities and can see the majority of the map at all times.
At the start of every other turn, random clouds are generated over specific cells, possibly limiting knowledge of enemy troops in cells with weather factors.
Clouds will be graphically indicated.

### Battle

The battle system is as follows:

At the start of combat, each player is shown a table with three columns pertaining to three "flanks" or partitions of the battlefield. Each flank has a dominant terrain type, from the region where the battle is occurring, that affects the effectiveness of units there more heavily than on the rest of the battlefield.
Alongside that table, they are shown their available troop allocations for infantry, armor, and helicopters. They are also shown the OpFor troop *count*, but not flank position, if it is known.
The player then splits each unit type into smaller sizes (see *Unit Sizes*) in order to create a balance of combined arms across all three flanks, optimizing based on flank terrain and expected enemy composition.

In battle, each of the three flanks fights the corresponding flank of the opposing side. Once the corresponding opposite flank is empty, the winning force's units in that position fight the next weakest enemy flank and gain a slight advantage in battle.
Once one side has been retreated, a pseudo-random percentage of casualties are restored to both sides, and the winner takes ownership of the region while the loser's regained troops move to a nearby cell.

 
