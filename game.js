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
 * @brief Shorthand for "opfor" used in SVG node class names
 */
const opfor_prefix = "of";

/**
 * @brief Shorthand for "blufor" used in SVG node class names
 */
const blufor_prefix = "bf";

/**
 * @brief Represents the entirety of one team's troops (of multiple types) within a given region.
 */
class Force{
	constrctor(pos, units){
		this.position = pos;
		this.unitList = units;	//document.getElementsByClassName(pos);
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