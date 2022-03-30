class Force{
	constrctor(pos){
		this.position = pos;
		this.Units = document.getElementsByClassName(pos);
	}

	//getters
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

}