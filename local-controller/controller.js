/*jshint esversion: 6 */
var Rainfall = require("rainfall");
var Tcp = require("rainfall-tcp");
var Rules = require("./Rules.js");

/*  Really simple controller, don't accept reconnections, do not ask for nodes description and no keepalive needed
*/

var regras = new Rules.Rules("./regras.txt");
regras.load();
var estadoCorrente = {};

var nodes = {};



Tcp.createDriver({rport:2356, broadcast_port: 2356, udplisten: true}, (err, driver) => {
	if (err) {
		print_message("Failed to start network interface:");
		print_message(err);
		return;
	}
	var rainfall = new Rainfall.Rainfall(driver);

	var sendCommand = function (command) {
		rainfall.send(
			{
				address: command.address,
				port: command.port,
				family: 'IPv4'
			},
			{
				packageType: 'command',
				command: [{
					id: command.dataId,
					value: command.value
				}]
			},
			() => {
				print_message('	[command] Command ' + command.value + " sent to node " + command.nodeId);
			}
		);
	};


	//Listens for new connections and reconnections (but do not recognize them)
	rainfall.listen((obj, from) => {
		print_message("[new node] whoiscontroller/iamback received from " + from.address + ":" + from.port + " ID:" + obj.id);

      //Send message, saying he is the controller and no need for keepalive messages
		var id = obj.id;
        nodes[id.toString()] = {address: from};

        rainfall.send(from, {
            packageType: 'iamcontroller | lifetime | describeyourself',
            'yourId': id,
            'lifetime': 0,
        }, (err)=>{
            if (err) {
				print_message(err);
			} else {
            print_message("[new node] iamcontroller sent to node " + id + " (" + from.address + ":" + from.port + ")");
			}
        });
	}, 'whoiscontroller | iamback');


	// Listens for descriptions
	rainfall.listen((obj, from) => {
		print_message("[NEW DESCRIPTION] from " + obj.id);
		var desc = {nodeClass: obj.nodeClass};

		var info = function(obj) {
			return obj.reduce((prev, cur)=>{
				if (prev[cur.id] !== undefined) console.error("dataType with repeated ids detected");
				prev[cur.id] = cur;
				return prev;
			}, {});
		};

		if (obj.nodeClass & Rainfall.NODE_CLASSES.actuator)
			desc.commandType = info(obj.commandType);
		if (obj.nodeClass & Rainfall.NODE_CLASSES.sensor)
			desc.dataType = info(obj.dataType);
		nodes[obj.id].desc = desc;
		//print_message("Description received: " + JSON.stringify(desc));
	}, 'description');


	//Listens for data
	rainfall.listen((obj, from) => {
		if (nodes[obj.id.toString()] == undefined) {
			print_message("[new data]	Received data from unknown node " + obj.id);
			return;
		}
        print_message("[new data] Data from node " + obj.id + " received: ");
        //Print all received data
		obj.data.forEach((data) => {
			var deviceId = obj.id + "." + data.id;
			estadoCorrente[deviceId] = data.value;
			console.log("deviceId: " + deviceId + " valor: " + data.value);
		});

		regras.checkConditions(estadoCorrente, (regra) => {
			console.log("Regra " + regra.ruleName + " satisfeita");
			for(var command of regra.commands){
					
				if (nodes[command.nodeId] == undefined){
					console.log("Node " + command.id + " não existe");

				// Enviar o comando
				}else{
					console.log("[SEND command] To node " + command.nodeId + "." + command.actuatorId + " : " + command.value);
					rainfall.send(nodes[command.nodeId].address, {
                    packageType: 'command',
                    command: [{
                        id: command.actuatorId,
                        value: command.value
                    }]
               }, (err) => {
               	if (err) console.log(err);
               });	
				}//if-else			

			}//for
		});
	}, 'data');


	//Listens for external commands
	rainfall.listen((obj, from) => {
		if (nodes[obj.id.toString()] == undefined) {
            print_message("[new external command] Received external command from unknown node " + obj.id);
            return;
        }
        print_message("[new external command] External Command from node " + obj.id + " received: ");
        obj.command.forEach((cmd) => {

				var deviceId = obj.id + "." + cmd.id;
				estadoCorrente[deviceId] = cmd.value;
				console.log("deviceId: " + deviceId + " valor: " + cmd.value);
        });

		regras.checkConditions(estadoCorrente, (regra) => {
			console.log("Regra " + regra.ruleName + " satisfeita");
			for(var command of regra.commands){
					
				if (nodes[command.nodeId] == undefined){
					console.log("Node " + command.id + " não existe");

				// Enviar o comando
				}else{
					console.log("[SEND command] To node " + command.nodeId + "." + command.actuatorId + " : " + command.value);
					rainfall.send(nodes[command.nodeId].address, {
                    packageType: 'command',
                    command: [{
                        id: command.actuatorId,
                        value: command.value
                    }]
               }, (err) => {
               	if (err) console.log(err);
               });	
				}//if-else			

			}//for
		});

	}, 'externalcommand');

	print_message("[initialized] Listening on port 2356 and broadcast port 2356");
});


//Function to not print messages while asking for input
var can_print = true;
var print_message = function () {
    var messages = [];

    return function (msg) {
        if (msg)
            messages.push(msg);
        if (can_print) {
            for (var message of messages) {
                console.log(message);
            }
            messages = [];
        }
    };

}();

