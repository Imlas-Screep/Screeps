//Game.spawns['Imlaspawn'].createCreep([CLAIM,MOVE,MOVE], undefined, {role: 'claimer', targetRoom: 'W1N67', targetPosX: 25, targetPosY: 1});
//Game.spawns['Imlaspawn'].createCreep([CLAIM,MOVE,MOVE], undefined, {role: 'claimer', targetRoom: 'W1N67'});

var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        /*
        //Random Serialization test - console prints false
        creep.memory.test = true;
        creep.memory.test = false;
        console.log('test:', creep.memory.test);
        creep.memory.test = true;
        */
        
        if(creep.room.name != creep.memory.targetRoom){
            //Head to target room
            var exitDir = Game.map.findExit(creep.room, creep.memory.targetRoom);
            var exitLoc = creep.pos.findClosestByRange(exitDir);
//            console.log(creep.name, exitDir, exitLoc);
            creep.moveTo(exitLoc);
        }
        else{
            if(creep.pos.isNearTo(creep.room.controller.pos)){
                creep.reserveController(creep.room.controller);
            }
            else{
                creep.moveTo(creep.room.controller);
            }
        }
	}
};

module.exports = roleClaimer;