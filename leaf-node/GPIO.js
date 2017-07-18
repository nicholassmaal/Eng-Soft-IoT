
var fs = require("fs");

// Constantes para direção da porta
var PORT_DIRECTION = {
	INPUT: 'in',
	OUTPUT: 'out'
}

// Definição da classe
function GPIOPort (portNumber) {
	this.port = portNumber;
   this.valueFile = "/sys/class/gpio/gpio" + portNumber + "/value";
	this.directionFile = "/sys/class/gpio/gpio" + portNumber + "/direction";
	this.desiredDirection = null;
	this.configuredDirection = null;
	this.readyCallback = null;

	this.isOpen = function(){
		return fs.existsSync(this.valueFile);
	};
	this.getDirection = function(){
		this.configuredDirection = fs.readFileSync(this.directionFile, "utf-8").trim();
		return this.configuredDirection;
	};
	this.open = function(direction, readyCallbackParam){
		// Se o parâmetro não está adequado
		if (direction != PORT_DIRECTION.INPUT && direction != PORT_DIRECTION.OUTPUT){
			console.log("GPIOPort.open port:" + this.port + " - Parâmetro não reconhecido: " + direction);
			console.log("GPIOPort.open port:" + this.port + " - Parâmetros válidos: 'in' ou 'out'");
			return;
		}//if

		this.readyCallback = readyCallbackParam;
		this.desiredDirection = direction;

		// Async
		fs.access(this.valueFile, fs.constants.F_OK, (err) => {
			
			if (err){// porta fechada
				// Abrir porta
				fs.writeFile("/sys/class/gpio/export", this.port.toString(), "utf-8", (err) => {
					if (err) throw err;
					setTimeout(this.asyncCheckDirection.bind(this), 1000);
				});

			}else{// Porta aberta
				console.log("GPIOPort.open port:" + this.port + " - Porta já está aberta");
				this.asyncCheckDirection();
			}//if-else
		});
	};
	this.asyncCheckDirection = function (){
		fs.readFile(this.directionFile, "utf-8", (err, data) => {
			if (err){
				throw err;
			}else{
				this.configuredDirection = data.trim();
				// Se está na direção correta
				if (this.desiredDirection == this.configuredDirection){
					console.log("GPIOPort.open port:" + this.port + " - Porta já está na direção desejada: " + this.configuredDirection);
					setTimeout(this.readyCallback, 0);

				}else{// Senão, mudar direção
					console.log("GPIOPort.open port:" + this.port + " - Configurando direção");
					setTimeout(this.asyncSetDirection.bind(this), 1000);
				}//if-else
			}//if-else
		});//readFile
	};
	this.asyncSetDirection = function(){
		fs.writeFile(this.directionFile, this.desiredDirection, "utf-8", (err) =>{
			if(err) throw err;
			this.configuredDirection = this.desiredDirection;
			setTimeout(this.readyCallback, 0);
		});
	};
	this.setValue = function(value){
		if (this.configuredDirection == PORT_DIRECTION.OUTPUT){
			var valueString = (value)? "1": "0";
			fs.writeFileSync(this.valueFile, valueString, "utf-8");
		}else{
			console.log("GPIOPort.setValue port:" + this.port + " ERROR - Tentativa de escrita em porta de INPUT: " + this.configuredDirection);
		}//if-else
	};
	this.getValue = function(){
		if (this.configuredDirection == PORT_DIRECTION.INPUT){
			var value = fs.readFileSync(this.valueFile, value, "utf-8");
			var booleanValue = (value == 1)? true : false;
			return booleanValue;
		}else{
			console.log("GPIOPort.getValue port:" + this.port + " ERROR - Tentativa de leitura em porta de OUTPUT");
		}//if-else
	}
}

module.exports.GPIOPort = GPIOPort;
module.exports.PORT_DIRECTION = PORT_DIRECTION;
