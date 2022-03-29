class Unit{
	constructor(type, position, count, side){
		this.side = side;
		this.health = 100*count;
		this.type = type; //maybe use templates for each type
		this.position = position;
		// this.movement = 
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