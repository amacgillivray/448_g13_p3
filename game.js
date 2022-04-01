/**
 * @file game.js
 * @brief Implements the game functionality.
 * 
 * @author Jarrod Grothusen
 * @author Andrew MacGillivray
 */

"use strict";

/**
 * @brief Name of the attribute that specifies how many troops are present in the region
 */
const troop_count_attr = "data-count";

/**
 * @brief troop type names as used in troop icon IDs in the game's SVG doc.
 */
const troop_type_names = [
    "infantry",
    "helicopter",
    "armor"
];

/**
 * @brief list of troop size names and the respective maximum troop count
 */
const troop_sizes = {
    fandm: 2,
    fireteam: 5,
    patrol: 10,
    section: 20,
    platoon: 40,
    company: 250, 
    battalion: 1000,
    regiment: 2000,
    brigade: 5000
};

/**
 * @brief use these ids to select a regional polygon
 */
const region_polygon_ids = [
    "alpha",
    "bravo",
    "charlie",
    "delta",
    "echo",
    "foxtrot",
    "golf",
    "hotel"
];

/**
 * @brief use these ids to select the entire region group node (including its name). 
 *        These are also used in troop node names 
 */
const region_group_ids = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h"
];

/**
 * @brief using the region group id as an index, tells what regions are 
 *        connected to each other.
 */
const region_connections = {
    a: [
        "b",
        "e",
        "h"
    ],
    b: [
        "a",
        "c",
        "e"
    ],
    c: [
        "b",
        "d",
        "e",
    ],
    d: [
        "c",
        "e",
        "f",
    ],
    e: [
        "a",
        "b",
        "c",
        "d",
        "f",
        "g",
        "h"
    ],
    f: [
        "d",
        "e",
        "g"
    ],
    g: [
        "e",
        "f",
        "h"
    ],
    h: [
        "a",
        "e",
        "g"
    ]
}

/**
 * @brief Shorthand for "opfor" used in SVG node class names
 */
const opfor_prefix = "of";

/**
 * @brief Shorthand for "blufor" used in SVG node class names
 */
const blufor_prefix = "bf";

function gameRegionClickCallback( e )
{
    e.currentTarget.obj._regionClickHandler(e);
}

function gameSelectedRegionClickCallback( e )
{
    e.currentTarget.obj._moveCancelHandler(e);
}

function gameMoveRegionClickCallback( e )
{
    e.currentTarget.obj._moveHandler(e);
}

/**
 * @brief Class containing static methods to interact with the map
 */
class GameMap {


    /**
     * @brief update the ownership of a region
     * @note could replace parameters with just a force object, since force knows region and owner
     * @todo if kept this way, replace owner type with enum
     * @param {string} region_phonetic
     * @param {string} owner 
     *                 Should be "opfor", "blufor", or "neutral"
     */
    static setRegionOwner( region_phonetic, owner )
    {
        document.getElementById(region_phonetic).className = "region " + owner;
    }

    /**
     * @brief Returns an array of Unit objects based on the troops present in the region.
     * @param {string} region_letter 
     * @returns 
     */
    static getUnitsInRegion( region_letter )
    {
        region_letter = region_letter.toLowerCase();
        let units = [];
        let team = document.getElementById(region_letter).classList.item(1);
        
        // If the region is empty, return
        if (team == "neutral") return units;

        // otherwise, get the correct prefix for the team whose troops are present
        team = (team == "blufor") ? team = blufor_prefix : team = opfor_prefix;

        // then get each troop in the region
        troop_type_names.forEach((unitType) => {
            // node id format: [teamprefix]_[regionletter]_[trooptype]
            let selector = team + "_" + region_letter + "_" + unitType;
            let node = document.getElementById(selector);
            if (node.classList.contains("t"))
            {
                // parse the node into a unit object
                units.push( new Unit(unitType, region_letter, node.getAttribute("data-count"), team) );
            } else {
                units.push( null );
            }
        });
        
        return units;
    }

    // may be deleted
    static updateUnitCount(unitId, newCount)
    {

    }
}

/**
 * @brief Represents the entirety of one team's troops (of multiple types) within a given region.
 * @note  make sure to prevent any addition of troops from the opposite side to a force when a battle 
 *        begins. Either make moving to an occupied region immediately begin a battle, or copy the 
 *        "side" variable from found units on startup and check when adding troops.
 */
class Force{
    
	constructor(region_group_id){
		this._region = region_group_id;
        this._unitList = GameMap.getUnitsInRegion(region_group_id);
        this._side = "neutral";
        troop_type_names.forEach((name, i) => {
            if (this._unitList[i] != null)
            {
                this._side = this._unitList[0].side;
            }
        });
	}

	//getters
	get side(){
		// for(i = 0; i < 3; i++){
		// 	if(this.unitList[i] != null){
		// 		return this.unitList[i].side;
		// 	}else if(i == 2){
		// 		return "neutral";
		// 	}
		// }
        return this._side;
	}
	get region(){
		return this._region;
	}
	get unitList(){
		return this._unitList;
	}
	get infantry(){
		return this._unitList[0];
	}
	get helicopter(){
		return this._unitList[1];
	}
	get armor(){
		return this._unitList[2];
	}
	get infantryCount(){
		return (this._unitList[0] == null) ? 0 : this._unitList[0].count;
	}
	get helicopterCount(){
		return (this._unitList[1] == null) ? 0 : this._unitList[1].count;
	}
	get armorCount(){
		return (this._unitList[2] == null) ? 0 : this._unitList[2].count;
	}

	//setters
	set position(p){
		this._position = p;
	}
	set unitList(uts){
		this._unitList = uts;
	}

	//methods
	alterForce(list){
		for(i = 0; i < 3; i++){
			if(list[i] != 0){
				this._unitList[i].alterUnits(list[i]);
			}
		}
	}

}

/**
 * @brief represents an individual troop type (infantry, helicopter, or armor)
 */
class Unit{

    constructor(type, position, count, side){

		this._side = side;
        
        switch (type) {
            case troop_type_names[0]:
                this.dmgMod = 2;
	    		this.hpMod = 10;
                break;
            case troop_type_names[1]: 
                this.dmgMod = 100;
                this.hpMod = 125;
                break;
            case troop_type_names[2]:
                this.dmgMod = 100;
                this.hpMod = 250;
        }

		this.health = this.hpMod * count;
		this.type = type;
		this.position = position;
		// this.movement = 
		// make a dom to attach to the visual element
	}

	//getters
	get hpMod(){
		return this._hpMod;
	}
	get dmgMod(){
		return this._dmgMod;
	}
	get side(){
		return this._side;
	}
	get type(){
		return this._type;
	}
	get position(){
		return this._position;
	}
	get health(){
		return this._health;
	}
	get count(){
		return Math.ceil((this.health) / (this.hpMod));
	}

	//setters
	set health(hp){
		this._health = hp;
	}
	set position(pos){
		this._position = pos;
	}
	set count(ct){
		this._count = ct;
	}
	set side(sd){
		this._side = sd;
	}
	set dmgMod(dm){
		this._dmgMod = dm;
	}
	set hpMod(hm){
		this._hpMod = hm;
	}
	set type(t){
	    this._type = t;
	}
	
	//methods
	//movement calc(){
		// mov = movementFunction(position.terrain, this.type)
		// this.movement = mov;
	// }
	updateHealth(dmg){
		this.health = this.health - dmg; 
	}
	alterUnits(cnt){
		this.count = this.count + cnt;
	}

}

// let test = new Unit("Inf", 1, 100, "A");
// console.log(test.type);
// console.log(test.health);
// console.log(test.hpMod);
// console.log(test.count);
// console.log(test.side);

/**
 * @brief todo
 */
class Terrain{
	constructor(pos){
		this.type;
		this.position;		
	}
}


class Game{



    constructor()
    {
        this.forces = [];
        this._initialize_forces();
        this._initialize_listeners();
        this._state = "initial";
        this._currentPlayerTurn = "bf";
    }

    getRegionForce(region_letter)
    {
        for (let i = 0; i < this.forces.length; i++)
        {
            if (this.forces[i].region == region_letter)
                return this.forces[i];
            else 
                continue;
        }
        return null;
    }

    moveTroops(src, dst, count){
    	//assuming count is valid

    	let A = getRegionForce(src);
    	let B = getRegionForce(dst);
    	let removeCount = count.map(function(x){x * -1});

    	//some verification may be needed for both zones
    	if(A.side == B.side || A.side == "neutral" || B.side == "neutral"){
    		//reduce count in source and increase count in destination
	    	A.alterForce(removeCount);
	    	B.alterForce(count);
    	}else{
    		console.log("invalid src or dst");
    		return 0;
    	}

    	//check win

    	return 0;
	}

    _initialize_forces()
    {
        region_group_ids.forEach((region) => {
            this.forces.push( new Force(region) );
        });
        console.log(this.forces);
    }

    _initialize_listeners()
    {
        region_group_ids.forEach((id) => {
            document.getElementById(id).addEventListener(
                "click",
                gameRegionClickCallback,
                [false, false]
            );
            document.getElementById(id).obj = this;
        });
    }

    _regionClickHandler( e )
    {
        // Guard for state: ensure multiple regions cannot be selected
        // at once. 
        if (this._state == "waitForMoveSelect") 
            return;
        this._state = "waitForMoveSelect";

        // use the realtarget variable to propagate up from whatever node 
        // was clicked to the node that is the group with the region-letter
        // as the id.
        let realtarget = e.currentTarget;
        while (realtarget.id.length != 1 && realtarget.nodeName != "svg")
            realtarget = realtarget.parentElement;

        // validate that the region is for the current player;
        // if not, reset state and return
        let clickedForce = this.getRegionForce(realtarget.id);
        if (clickedForce.side != this._currentPlayerTurn)
        {
            this._state = "initial";
            return;
        }

        // mark the region group as selected and add an event listener for
        // re-clicking on the region to cancel movement.
        realtarget.classList.add("selected");
        realtarget.addEventListener(
            "click",
            gameSelectedRegionClickCallback,
            [false, true]
        );
        realtarget.obj = this;

        // mark valid moves and add event listeners for their selection.
        region_connections[realtarget.id].forEach((validMove) => {
            let node = document.getElementById(validMove);
            node.classList.add("validmove");
            node.addEventListener(
                "click",
                gameMoveRegionClickCallback,
                [false, true]
            );
            node.obj = this;
            node.cf = clickedForce;
        });
    }

    _moveCancelHandler( e )
    {
        if (this._state != "waitForMoveSelect") 
            return;
        this._state = "initial";

        e.currentTarget.classList.remove("selected");

        region_connections[e.currentTarget.id].forEach((validMove) => {
            let node = document.getElementById(validMove);
            node.classList.remove("validmove");
            node.removeEventListener(
                "click",
                gameMoveRegionClickCallback,
                [false, true]
            );
        });

        // e.currentTarget.addEventListener(
        //     "click",
        //     gameRegionClickCallback,
        //     false
        // );
        // e.currentTarget.obj = this;
    }
    
    _moveHandler( e )
    {
        if (this._state != "waitForMoveSelect") 
            return;
        this._state = "initial";

        e.currentTarget.classList.remove("selected");
        
        e.currentTarget.addEventListener(
            "click",
            gameRegionClickCallback,
            false
        );
        e.currentTarget.obj = this;

        region_connections[e.currentTarget.id].forEach((validMove) => {
            let node = document.getElementById(validMove);
            node.classList.remove("validmove");
            node.removeEventListener(
                "click",
                gameMoveRegionClickCallback,
                false
            );
        });


    }
}

let game = new Game;
