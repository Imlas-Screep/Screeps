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
        
        //Behavior has 3 phases
        //1 - moving to target room
        //2 - controller sighted - moving to it
        //3 - reserving controller
        
        if(!creep.memory.targetSighted && !creep.memory.atTarget){
            //Creep is fresh, initializing memory
            creep.memory.isTraveling = true;
            creep.memory.targetSighted = false;
            creep.memory.atTarget = false;
        }
        
        if(creep.room.name == creep.memory.targetRoom){
            creep.memory.targetSighted = true;
            creep.memory.targetX = creep.room.controller.pos.x;
            creep.memory.targetY = creep.room.controller.pos.y;

/*
            console.log("1", creep.name, creep.room.controller.pos.x, creep.room.controller.pos.y, creep.room.controller.pos.roomName);
            console.log("2", creep.name, creep.room.controller.pos);
            var targetPos = new RoomPosition(creep.room.controller.pos.x, creep.room.controller.pos.y, creep.room.controller.pos.roomName);
            console.log("3", creep.name, testPos);
            */
        }
        
        //Phase1
        if((creep.room.name != creep.memory.targetRoom) && !creep.memory.targetSighted){
//            console.log(creep.name, 'ping1');
            var exitDir = Game.map.findExit(creep.room, creep.memory.targetRoom);
            var exitLoc = creep.pos.findClosestByPath(exitDir);
            
            creep.moveTo(exitLoc);
            
            if(creep.room.name == creep.memory.targetRoom){
                creep.memory.targetX = creep.room.controller.pos.x;
                creep.memory.targetY = creep.room.controller.pos.y;
                creep.memory.targetSighted = true;
            }
        }
        
        //Phase 2
        if(creep.memory.targetSighted && !creep.memory.atTarget){
//           console.log(creep.name, 'ping2');
            var targetPos = new RoomPosition(creep.memory.targetX, creep.memory.targetY, creep.memory.targetRoom);
            if(creep.pos.isNearTo(targetPos)){
                creep.memory.atTarget = true;
            }
            else{
//                console.log(creep.name, creep.pos, targetPos);
                var moveResult = creep.moveTo(targetPos);
//                console.log(creep.name, creep.pos, moveResult);
            }
        }
        
        //Phase 3
        if(creep.memory.atTarget){
//            console.log(creep.name, 'ping3');
            creep.reserveController(creep.room.controller);
        }
        
        /*
        //OLD CODE BEGINS HERE
        if((creep.room.name != creep.memory.targetRoom)){
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
        */
	}
};

module.exports = roleClaimer;