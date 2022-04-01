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

/**
 * @brief Class containing static methods to interact with the map
 */
class GameMap {

    static setRegionOwner( region_letter, owner )
    {

    }

    static getUnitsInRegion( region_letter )
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
    
	constrctor(region_group_id){
		this.region = region_group_id;
        this.units = GameMap.getUnitsInRegion(region_group_id);
	}

	//getters
	get position(){
		return this._position;
	}
	get unitList(){
		return this._unitList;
	}
	get inf(){
		return this._unitList[0];
	}
	get hel(){
		return this._unitList[1];
	}
	get tank(){
		return this._unitList[2];
	}
	get infCount(){
		return this._unitList[0].count;
	}
	get helCount(){
		return this._unitList[1].count;
	}
	get tankCount(){
		return this._unitList[2].count;
	}

	//setters
	set position(p){
		this._position = p;
	}
	set unitList(uts){
		this._unitList = uts;
	}

}

/**
 * @brief represents an individual troop type (infantry, helicopter, or armor)
 */
class Unit{
	constructor(type, position, count, side){

		this.side = side;
        
		if(type == "Inf"){
			this.dmgMod = 2;
			this.hpMod = 10;
		}else if(type == "Hel"){
			this.dmgMod = 100;
			this.hpMod = 125;
		}else{
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

function initialize_troops()
{

    // region_group_ids.forEach((region) => {
    //     let n
    // })   
}