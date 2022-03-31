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

let test = new Unit("Inf", 1, 100, "A");
console.log(test.type);
console.log(test.health);
console.log(test.hpMod);
console.log(test.count);
console.log(test.side);
