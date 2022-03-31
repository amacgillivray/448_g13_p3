class Force{
	constrctor(pos, units){
		this.position = pos;
		this.unitList = units;	//document.getElementsByClassName(pos);
	}

	//getters
	get position(){
		return this._position;
	}
	get unitLis(){
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