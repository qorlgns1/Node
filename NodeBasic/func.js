const {odd,even} = require('./var')

function checkNum(num){
	if(num % 2){
		return odd
	}else{
		return even
	}
}

module.exports = checkNum