class Unit{
	constructor(type, position, count, side){

// For Andrew: get the inheritance to work properly for the unit

		this.side = side;
		this.health = 100*count;
		this.type = type; //maybe use templates for each type
		this.position = position;
		// this.movement = 
		// make a dom to attach to the visual element
	}

	//getters
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
		return Math.ceil((this.health)/100);
	}

	//setters
	set health(dmg){
		this._health = this.health - dmg;
	}
	set position(pos){
		this._position = pos;
	}
	set count(ct){
		this._count = ct;
	}
	
	//methods
	//movement calc(){
		// mov = movementFunction(position.terrain, this.type)
		// this.movement = mov;
	// }

}

class Infantry extends Unit{
	constructor(){
		this.hpMod = 10;
		this.dmgMod = 2;
	}

	//getters
	get hpMod(){
		return this._hpMod;
	}
	get dmgMod(){
		return this._dmgMod;
	}

}

class Helicopter extends Unit{
	constructor(){
		this.hpMod = 100;
		this.dmgMod = 125;
	}

	//getters
	get hpMod(){
		return this._hpMod;
	}
	get dmgMod(){
		return this._dmgMod;
	}
}

class Tank extends Unit{
	constructor(){
		this.hpMod = 250;
		this.dmgMod = 100;
	}

	//getters
	get hpMod(){
		return this._hpMod;
	}
	get dmgMod(){
		return this._dmgMod;
	}
}