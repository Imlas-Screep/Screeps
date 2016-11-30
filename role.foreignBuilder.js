//Game.spawns['Imlaspawn'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'foreignBuilder', targetRoom: 'W1N67', targetPosX: 25, targetPosY: 1});

var roleForeignBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('building');
	    }
        
        //Not in target room
        if(creep.room.name != creep.memory.targetRoom){
            //Head to target room
            creep.moveTo(new RoomPosition(creep.memory.targetPosX, creep.memory.targetPosY, creep.memory.targetRoom));
        }
        else {
        //In target room
          	if(creep.memory.building && creep.carry.energy == 0) {
                creep.memory.building = false;
                creep.say('harvesting');
	        }
	        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
    	        creep.memory.building = true;
	            creep.say('building');
	        }
	        
	        if(creep.memory.building) {
//	            console.log("building");
    	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(targets.length) {
                    var buildTarget = creep.pos.findClosestByRange(targets);
                    if(creep.build(buildTarget) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(buildTarget);
                    }
                }
                else{
                    //If there's no more construction projects, move back to home spawn (to clear away from energy sources)
                    creep.say('All Done!');
                    creep.moveTo(Game.spawns['Imlaspawn']);
                }
	        }
    	    else {
//    	        console.log("!building");
	            //Builders will attempt to scavenge dropped energy
	            var droppedE = creep.room.find(FIND_DROPPED_RESOURCES);
	            if(droppedE.length){
    	            creep.moveTo(droppedE[0]);
	                creep.pickup(droppedE[0]);
	            }
	            else{
    	            var sources = creep.room.find(FIND_SOURCES);
                    if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources[0]);
                    }
	            }
            }
	    }

	}
};

module.exports = roleForeignBuilder;