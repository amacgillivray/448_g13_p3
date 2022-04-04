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

const team_key = {
    bf: "<span class=\"bluetext\">NATO</span>",
    of: "<span class=\"redtext\">PACT</span>"
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

const region_phonetic_key = {
    a: "alpha",
    b: "bravo",
    c: "charlie",
    d: "delta",
    e: "echo",
    f: "foxtrot",
    g: "golf",
    h: "hotel"
};

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


function gameLog( message, classlist = "" )
{
    let log = document.getElementById("log");
    let date = new Date;
    let dateStr = "";
    let container = document.createElement("p");
    if ( classlist != "" ) 
        container.setAttribute("class", classlist);
    container.setAttribute("id", "l" + log_entries);

    date.setTime(Date.now());
    dateStr = (date.getHours().toString().length < 2) ? "0" + date.getHours().toString() : date.getHours().toString();
    dateStr += ":"
    dateStr += (date.getMinutes().toString().length < 2) ? "0" + date.getMinutes().toString() : date.getMinutes().toString();
    dateStr += ":"
    dateStr += (date.getSeconds().toString().length < 2) ? "0" + date.getSeconds().toString() : date.getSeconds().toString();

    container.innerHTML = "<span class=\"date\">" + dateStr + "</span>" + message;

    if (log_entries-1 < 0)
        log.appendChild(container);
    else 
        log.insertBefore(container, document.getElementById("l" + (log_entries-1)));

    log_entries++;
}

function getBestTroopCountSymbol( size )
{
    let icon_sizes = [
        2,
        5,
        10,
        20,
        40,
        250,
        1000,
        2000,
        5000
    ];

    let icon_names = [
        "fandm",
        "fireteam",
        "patrol",
        "section",
        "platoon",
        "company",
        "battalion",
        "regiment",
        "brigade"
    ];

    for (let i = 0; i < icon_sizes.length; i++)
    {
        if (size <= icon_sizes[i]){
            return icon_names[i];
        }
    }

    // if no match is found, return the biggest supported troop symbol.
    return "brigade";
}

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

    static updateUnitDisplay(unit)
    {
        let node = unit.side + "_" + unit.region + "_" + unit.type;
        //console.log(node);
        // node = document.getElementById(node);

        //console.log("Troop count: " + unit.count);
        document.getElementById(node).setAttribute("data-count", unit.count)

        // Hide or unhide the unit based on its count.
        if (unit.count <= 0) {
            // console.log("Hiding unit.");
            document.getElementById(node).setAttribute("class", "t_np");

            // make the troop count hidden as well
            let sz = document.getElementById(node).querySelector(".tc");
            if (sz != null){
                sz.classList.remove("tc");
                sz.classList.add("tc_h");
            }
        }
        else if (unit.count > 0){
            // console.log("Revealing unit.");
            document.getElementById(node).setAttribute("class", "t");

            // console.log(".tc_h." + getBestTroopCountSymbol(unit.count));

            // If the troop already existed, remove its old count indicator first
            let sz0 = document.getElementById(node).querySelector(".tc");
            if (sz0 != null) { 
                sz0.classList.remove("tc");
                sz0.classList.add("tc_h");
            }

            // Make the appropriate troop count icon visible
            let sz = document.getElementById(node).querySelector("." + getBestTroopCountSymbol(unit.count));
            if (sz == null ){
                // todo - test in project 4
                // alert("Unable to find size symbol for " + unit.side + " " + unit.type + " with count " + unit.count);
                return;
            }
            sz.classList.remove("tc_h");
            sz.classList.add("tc");
            //document.getElementById(node).querySelector("." + getBestTroopCountSymbol(unit.count)).setAttribute("class", "tc");
        }
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
        this._determineSide();
	}

	//getters
	get side(){
        return this._side;
	}
	get region(){
		return this._region;
	}
    get region_phonetic(){
        return region_phonetic_key[this._region];
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

    get totalCount() {
        return this.infantryCount + this.helicopterCount + this.armorCount;
    }

	//setters
	
    set region(p){
		this._region = p;
	}
	set unitList(uts){
		this._unitList = uts;
        this._determineSide();
	}
    // set side(newSide)
    // {
    //     this._side = newSide;
    //     document.getElementById(this._region).setAttribute("class", "region " + this._side);
    // }

	//methods
	alterForce(list){
		for(let i = 0; i < 3; i++){
			if(this._unitList[i] != null){
				this._unitList[i].alterUnits(list[i]);
                GameMap.updateUnitDisplay(this._unitList[i]);
			} else {
                // todo check later
                this._unitList[i] = new Unit(
                    troop_type_names[i],
                    this._region,
                    list[i],
                    this._side
                );
                console.log(this._unitList[i] + ": " + list[i]);
                GameMap.updateUnitDisplay(this._unitList[i]);
            }
		}

        // Remove empty units
        for(let i = 0; i < 3; i++){
			if(this._unitList[i].count == 0){
                this._unitList[i] = null;
            }
        }

        this._determineSide();
	}

    // Todo - make "damage" an array to tell what fraction is from inf, hel, armor,
    // and give the respective buffs / debuffs vs other units. 
    distributeDamage( damage )
    {

        let types_present = 0;
        // let fractional_damage = 0;
        let newIc = 0;
        let newHc = 0;
        let newAc = 0;
        let af = [ 0, 0, 0 ];

        // random number between 0 and 1 to determine how to distribute damage between infantry
        // and vehicles. Infantry damage is multiplied by balanceFactor, while vehicle damage 
        // is divided by it.
        let balanceFactor = Math.random();

        if (this.infantryCount > 0)
            types_present++;
        if (this.armorCount > 0)
            types_present++;
        if (this.helicopterCount > 0)
            types_present++;
        

        let damageMatrix = [
            balanceFactor * (this.infantryCount / this.totalCount),
            (1/balanceFactor) * (this.helicopterCount / this.totalCount),
            (1/balanceFactor) * (this.armorCount / this.totalCount)
        ];

        if (this.infantryCount > 0)
        {
            newIc = this.infantryCount - ((damageMatrix[0] * damage) / this.infantry.hpMod);
            if (newIc < 0) {
                newIc = 0;
            }
            af[0] = (newIc - this.infantryCount);
        }

        if (this.helicopterCount > 0)
        {
            newHc = this.helicopterCount - ((damageMatrix[1] * damage) / this.helicopter.hpMod);
            if (newHc < 0) {
                newHc = 0;
            }
            af[1] = (newHc - this.helicopterCount);
        }

        if (this.armorCount > 0)
        {
            newAc = this.armorCount - ((damageMatrix[2] * damage) / this.armor.hpMod);
            if (newAc < 0) {
                newAc = 0;
            }
            af[2] = (newAc - this.armorCount);
        }

        this.alterForce(af);
    }

    _determineSide()
    {
        let prev_side = this._side; 

        this._side = "neutral";
        for (let i = 0; i < troop_type_names.length; i++)
        {
            if (this._unitList[i] != null)
            {
                this._side = this._unitList[i].side;
                break;
            }
        }
        // troop_type_names.forEach((name, i) => {
        //});

        if (!document.getElementById(this._region).classList.contains(this._side))
        {
            document.getElementById(this._region).setAttribute("class", "region " + this._side);
        }

        if (prev_side != "neutral")
            document.getElementById("s-" + prev_side + "-" + this._region).classList.toggle("sh", true);
        if (this._side != "neutral") {
            console.log("s-" + this._side + "-" + this._region);
           document.getElementById("s-" + this._side + "-" + this._region).classList.toggle("sh", false);
        }
    }
}

/**
 * @brief represents an individual troop type (infantry, helicopter, or armor)
 */
class Unit{

    constructor(type, region, count, side){

		this._side = side;
        this._id = side + "_" + region + "_" + type;

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
		this.region = region;
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
	get region(){
		return this._region;
    }
    get region_phonetic(){
        return region_phonetic_key[this._region];
    }
	get health(){
		return this._health;
	}
	get count(){
		return (this.health > 0) ? Math.ceil((this.health) / (this.hpMod)) : 0;
	}
    get id()
    {
        return this._id;
    }

	//setters
	set health(hp){
		this._health = hp;
	}
	set region(pos){
		this._region = pos;
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
		// mov = movementFunction(region.terrain, this.type)
		// this.movement = mov;
	// }
	updateHealth(dmg){
		this.health = this.health - dmg; 
	}
	alterUnits(cnt){
        console.log("Adding " + cnt + " to " + this._id);
		this._health += (this.hpMod * cnt);
        document.getElementById(this._id).setAttribute("data-count", this.count);
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
		this.region;		
	}
}

function battleCb( obj )
{
    obj._tick();
}

class Battle {

    /**
     * @brief Construct a battle using a defender and attacker.
     *        Battle takes place in the defending force's cell.
     * @param {*} defending_force 
     * @param {*} attacking_force 
     */
    constructor( defending_force, attacking_force )
    {
        this._off = attacking_force;
        this._offRefCt = [
            this._off.infantryCount,
            this._off.helicopterCount,
            this._off.armorCount
        ];

        this._def = defending_force;
        this._defRefCt = [
            this._def.infantryCount,
            this._def.helicopterCount,
            this._def.armorCount
        ];

        this._refSides = [
            this._off.side, 
            this._def.side
        ];

        // Choose a location for defender casualties to 
        // retreat to in case of defeat.
        this._defFb = null;
        let avail_fb = region_connections[this._def.region];
        for (let i = 0; i < avail_fb.length; i++)
        {
            for (let e = 0; e < game.forces.length; e++)
            {
                if (game.forces[e].region == avail_fb[i] && game.forces[e].side == this._def.side)
                    this._defFb = game.forces[e];
            }
        }

        this._ticks = 0;

        //log.innerHTML += "<p>" + this._off.side.toUpperCase() + " attacked " + this._def.region_phonetic + " from " + this._off.region_phonetic + "</p>\n";

        gameLog( 
            team_key[this._off.side] + 
            " attacks " + this._def.region_phonetic + 
            " from " + this._off.region_phonetic + 
            "<br/><progress id=\"p_battle_" + battle_ct + "\" class=\"battle\" max=\"100\" value=\"50\"></progress>"); 
        // document.getElementById("p_bfof").setAttribute("class", "battle");
        
        // this._interval = null
        // document.getElementById("battleind").innerHTML = " - IN BATTLE AT " + defending_force.region_phonetic.toUpperCase();
        
        //document.getElementById("s-" + this._off._side + "-" + this._def._region).classList.toggle("sh", false);
    }

    start()
    {
        this._interval = setInterval(battleCb, [200], this);
    }


    // called by the move handler fn when opposing armies try to 
    // occupy the same cell. 
    end()
    {
        clearInterval(this._interval);

        let winside = "";
        let verb = "";
        let troopLossRecord = "";

        if (this._off.totalCount == 0)
        {

            // partially restore casualties
            this._def.alterForce(
                [
                    Math.floor((this._defRefCt[0]-this._def.infantryCount)*Math.random()),
                    Math.floor((this._defRefCt[1]-this._def.helicopterCount)*Math.random()),
                    Math.floor((this._defRefCt[2]-this._def.armorCount)*Math.random())
                ]
            );
            this._off._side = this._refSides[0];
            this._off.alterForce(
                [
                    Math.floor((this._offRefCt[0]-this._off.infantryCount)*Math.random()),
                    Math.floor((this._offRefCt[1]-this._off.helicopterCount)*Math.random()),
                    Math.floor((this._offRefCt[2]-this._off.armorCount)*Math.random())
                ]
            );

            winside = team_key[this._def.side];
            verb = "maintains";
            troopLossRecord = 
            "<pre>" +
            "LOSSES:\n" +
            "-------\n" +
            "             ATTACKER" + "\n" +
            "INFANTRY:    " + (this._off.infantryCount - this._offRefCt[0]).toString() + "\n" +
            "ROTORCRAFT:  " + (this._off.helicopterCount - this._offRefCt[1]).toString() + "\n" +
            "ARMOR:       " + (this._off.helicopterCount - this._offRefCt[2]).toString() + "\n\n" +
            "             DEFENDER" + "\n" +
            "INFANTRY:    " + (this._def.infantryCount - this._defRefCt[0]).toString() + "\n" +
            "ROTORCRAFT:  " + (this._def.helicopterCount - this._defRefCt[1]).toString() + "\n" +
            "ARMOR:       " + (this._def.helicopterCount - this._defRefCt[2]).toString() +
            "</pre>";

        } else {
            winside = team_key[this._off.side];
            verb = "takes";

            // restore defender losses if a fallback position exists
            let def_restored = [
                Math.floor((this._defRefCt[0])*Math.random()/2),
                Math.floor((this._defRefCt[1])*Math.random()/2),
                Math.floor((this._defRefCt[1])*Math.random()/2)
            ];
            if (this._defFb != null)
                this._defFb.alterForce(def_restored);
            else 
                def_restored = [0,0,0];


            // restore attacker losses 
            this._off.alterForce(
                [
                    Math.floor((2/3)*(this._offRefCt[0]-this._off.infantryCount)*Math.random()),
                    Math.floor((2/3)*(this._offRefCt[1]-this._off.helicopterCount)*Math.random()),
                    Math.floor((2/3)*(this._offRefCt[1]-this._off.armorCount)*Math.random())
                ]
            );

            // create the loss record using the numbers from AFTER restorations are performed
            // provide notice of where the defenders routed to
            troopLossRecord = 
            "<pre>" +
            "LOSSES:\n" +
            "-------\n" +
            "             ATTACKER" + "\n" +
            "INFANTRY:    " + (this._off.infantryCount - this._offRefCt[0]).toString() + "\n" +
            "ROTORCRAFT:  " + (this._off.helicopterCount - this._offRefCt[1]).toString() + "\n" +
            "ARMOR:       " + (this._off.helicopterCount - this._offRefCt[2]).toString() + "\n\n" +
            "             DEFENDER" + "\n" +
            "INFANTRY:    " + -(this._defRefCt[0] - def_restored[0]).toString() + "\n" +
            "ROTORCRAFT:  " + -(this._defRefCt[1] - def_restored[1]).toString() + "\n" +
            "ARMOR:       " + -(this._defRefCt[2] - def_restored[2]).toString();
            if (this._defFb != null)
                troopLossRecord += "\n\n" + (def_restored[0]+def_restored[1]+def_restored[2]).toString() + " SURVIVING DEFENDERS\nROUTED TO " + region_phonetic_key[ this._defFb.region ].toUpperCase();
            troopLossRecord += "</pre>";
            
            // Update the owner of the cell to be the attacker, and move their troops there.
            this._def._side = this._off.side;
            this._def.alterForce(
                [
                    this._off.infantryCount,
                    this._off.helicopterCount,
                    this._off.armorCount
                ]
            );

            this._off.alterForce(
                [
                    (-1)*this._off.infantryCount,
                    (-1)*this._off.helicopterCount,
                    (-1)*this._off.armorCount
                ]
            );

            

        }

        
        gameLog( winside + " " + verb + " control of " + this._def.region_phonetic + "." + troopLossRecord);

        battle_ct++;
        game.battleEndCb();

    	return;
    }

    /**
     * @brief called repeatedly until the battle ends.
     *        For now, should deal damage entirely at random
     *        Will later be updated to match specifications.
     */
    _tick()
    {
        const s = Date.now();
        let now = null;

        console.log("Tick #" + this._ticks);
        this._ticks++;
        this._drawProgress();

        // Damage by attackers
        let dmgo = 0;

        // Damage by defenders
        let dmgd = 0;

        // Calculate dmgo
        if (this._off.infantry != null)
            dmgo += this._off.infantryCount * this._off.infantry.dmgMod * Math.random();
        if (this._off.helicopter != null)
            dmgo += this._off.helicopterCount * this._off.helicopter.dmgMod * Math.random();
        if (this._off.armor != null)
            dmgo += this._off.armorCount * this._off.armor.dmgMod * Math.random();

        // Calculate dmgd
        if (this._def.infantry != null)
            dmgd += this._def.infantryCount * this._def.infantry.dmgMod * Math.random();
        if (this._def.helicopter != null)
            dmgd += this._def.helicopterCount * this._def.helicopter.dmgMod * Math.random();
        if (this._def.armor != null)
            dmgd += this._def.armorCount * this._def.armor.dmgMod * Math.random();

        // Deal damage to offense
        this._off.distributeDamage(dmgd);

        // Deal damage to defense
        this._def.distributeDamage(dmgo);

        if ( this._off.totalCount <= 0 || this._def.totalCount <= 0 )
        {        
            this._drawProgress();
            this.end();
        }

        return;
    }

    _drawProgress()
    {
        if (this._off.side == "of")
        {
            document.getElementById("p_battle_" + battle_ct).setAttribute("value", (this._def.totalCount/(this._def.totalCount+this._off.totalCount+1))*100);
        } else {
            document.getElementById("p_battle_" + battle_ct).setAttribute("value", (this._off.totalCount/(this._off.totalCount+this._def.totalCount+1))*100);
        }
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

        this.forces.forEach((force) => {
            if (force.side == this._currentPlayerTurn)
                {
                    document.getElementById(force.region).classList.toggle("cpt", true);
                }
        });
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
        // ADD LISTENER FOR REGION CLICK BY CURRENT PLAYER
        region_group_ids.forEach((id) => {
            console.log("Added event listener for " + id);
            document.getElementById(id).addEventListener(
                "click",
                gameRegionClickCallback,
                [false, false]
            );
            document.getElementById(id).obj = this;
        });
    }

    _changeTurn()
    {
        this.forces.forEach((force) => {
            if (force.side == this._currentPlayerTurn) 
                document.getElementById(force.region).classList.toggle("cpt", false);
        });

        // troop counts
        let bf_tc = 0;
        let of_tc = 0;

        // region counts
        let bf_rc = 0;
        let of_rc = 0;

        for(let i = 0; i < this.forces.length; i++)
        {
            if (this.forces[i].side == "bf")
            {
                bf_tc += this.forces[i].totalCount;
                bf_rc++;
            }
            else if (this.forces[i].side == "of")
            {
                of_tc += this.forces[i].totalCount;
                of_rc++;
            }
        }

        document.getElementById("p_bfof").setAttribute("value", ((bf_tc)/(bf_tc+of_tc))*100);

        if (bf_rc == 0)
        {
            this._handleWin("of");
            return;
        } else if (of_rc == 0)
        {
            this._handleWin("bf");
            return;
        }

        if(this._currentPlayerTurn == "bf"){
    		this._currentPlayerTurn = "of";
            document.getElementById("turn-indicator").setAttribute("class", "opfor");
            document.getElementById("team").innerHTML = "OPFOR (PACT)";
    	}else if(this._currentPlayerTurn == "of"){
    		this._currentPlayerTurn = "bf";
            document.getElementById("turn-indicator").setAttribute("class", "blufor");
            document.getElementById("team").innerHTML = "BLUFOR (NATO)";
    	}

        this.forces.forEach((force) => {
            if (force.side == this._currentPlayerTurn)
                {
                    document.getElementById(force.region).classList.toggle("cpt", true);
                }
        });
    }

    _handleWin( winteam )
    {
        this.forces.forEach((force) => { 
            document.getElementById(force.region).classList.toggle("neutral", false);
            document.getElementById(force.region).classList.toggle(winteam, true);
            document.getElementById("s-" + winteam + "-" + force.region).classList.toggle("sh", false);
        });

        document.getElementById("turn-indicator").innerHTML = team_key[winteam] + " VICTORY";

        gameLog(team_key[winteam] + " VICTORY.\nRefresh the page to play again!");

    }

    _regionClickHandler( e )
    {
        // Guard for state: ensure multiple regions cannot be selected
        // at once. 
        if (this._state == "waitForMoveSelect" || this._state == "battle") 
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
        // ADD LISTENER FOR CANCEL MOVEMENT
        console.log("Added OTU event listener for " + realtarget + " click-to-cancel");
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

            // ADD LISTENER FOR MOVING TROOPS
            console.log("Added OTU event listener for " + realtarget + " move to " + validMove);
            node.addEventListener(
                "click",
                gameMoveRegionClickCallback,
                [false, true]
            );
            node.obj = this;
            node.oc = realtarget.id;
            node.cf = clickedForce;
        });
    }

    _moveCancelHandler( e )
    {
        if (this._state != "waitForMoveSelect") 
            return;
        this._state = "initial";

        e.currentTarget.classList.remove("selected");

        // REMOVE LISTENERS FOR VALIDMOVES
        region_connections[e.currentTarget.id].forEach((validMove) => {
            let node = document.getElementById(validMove);
            node.classList.remove("validmove");

            console.log("Removed OTU event listener for " + node.id + " move from " + e.currentTarget.id);
            node.removeEventListener(
                "click",
                gameMoveRegionClickCallback,
                [false, true]
            );
        });

        // REMOVE LISTENER FOR MOVING TROOPS
        console.log("Removed OTU event listener for " + e.currentTarget.id + " click-to-cancel");
        e.currentTarget.removeEventListener(
            "click",
            gameSelectedRegionClickCallback,
            [false, true]
        );

            
        // e.currentTarget.addEventListener(
        //     "click",
        //     gameRegionClickCallback,
        //     [false, false]
        // );
        // e.currentTarget.obj = this;
    }
    
    //set this._currentPlayerTurn to "of" then back to "bf" in an alternating manner

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

        // Remove "selected" class from origin
        document.getElementById(e.currentTarget.oc).classList.remove("selected");

        // Remove "validmove" class from move options
        region_connections[e.currentTarget.oc].forEach((validMove) => {
            let node = document.getElementById(validMove);
            node.classList.remove("validmove");
            console.log("Removed OTU event listener for " + node.id + " move from " + e.currentTarget.oc);
            node.removeEventListener(
                "click",
                gameMoveRegionClickCallback,
                [false, true]
            );
        });

        console.log("Removed OTU event listener for " + e.currentTarget.oc + " click-to-cancel");
        document.getElementById(e.currentTarget.oc).removeEventListener(
            "click",
            gameSelectedRegionClickCallback,
            [false, true]
        );

        //console.log(e.currentTarget.id);
        console.log("dst: " + e.currentTarget.id);
        let dstForce = this.getRegionForce(e.currentTarget.id);
        console.log("src: " + e.currentTarget.oc);
        let srcForce = this.getRegionForce(e.currentTarget.oc);

        // Allow transfer of troops if the target region is 
        // neutral or already owned by the current player.
        // Otherwise, start a battle and return
        if (dstForce.side == "neutral")
            dstForce._side = srcForce.side;
        else if (dstForce.side != this._currentPlayerTurn)
        {
            this._state = "battle";
            let battle = new Battle(dstForce, srcForce);
            battle.start();
            return;
        }

        //log.innerHTML += "<p>" + this._currentPlayerTurn.toUpperCase() + " moved from " + srcForce.region_phonetic + " to " + dstForce.region_phonetic + "</p>\n";
        gameLog( team_key[this._currentPlayerTurn] + " moves from " + srcForce.region_phonetic + " to " + dstForce.region_phonetic );

        dstForce.alterForce([
            srcForce.infantryCount, 
            srcForce.helicopterCount,
            srcForce.armorCount
            ]
        );

        srcForce.alterForce(
            (-1)*srcForce.infantryCount, 
            (-1)*srcForce.helicopterCount,
            (-1)*srcForce.armorCount
        );


        this._changeTurn();

    }

    battleEndCb()
    {
        if (this._state != "battle")
            return;
        this._state = "initial";
        this._changeTurn();
    }
}

let game = new Game;
let log_entries = 0;
let battle_ct = 0;