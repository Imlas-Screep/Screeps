//Game.spawns['Imlaspawn'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'foreignRoadRepairer', targetRoom: 'W1N67', targetPosX: 25, targetPosY: 1});

var roleForeignRoadRepairer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
	    if(creep.memory.repairing && creep.carry.energy == 0) {
            creep.memory.repairing = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.repairing = true;
	        creep.say('repairing');
	    }
        
        //Not in target room
        if(creep.room.name != creep.memory.targetRoom){
            //Head to target room
            creep.moveTo(new RoomPosition(creep.memory.targetPosX, creep.memory.targetPosY, creep.memory.targetRoom));
        }
        else {
        //In target room
          	if(creep.memory.repairing && creep.carry.energy == 0) {
                creep.memory.repairing = false;
                creep.say('harvesting');
	        }
	        if(!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
    	        creep.memory.repairing = true;
	            creep.say('repairing');
	        }
	        
	        if(creep.memory.repairing) {
//	            console.log("building");
                //First attempts to find critically damaged roads
                var potentialTargets = creep.room.find(FIND_STRUCTURES, {
                    filter: function(object){
                        return object.structureType == STRUCTURE_ROAD && (object.hits < (object.hitsMax * 0.25));
                    }
                });
                //console.log("critical",potentialTargets.length);
                
                var roadToRepair = creep.pos.findClosestByPath(potentialTargets);
                
                //If it doesn't find anything, get roads that are kinda hurt
                if(!roadToRepair){
                    potentialTargets = creep.room.find(FIND_STRUCTURES, {
                        filter: function(object){
                            return object.structureType == STRUCTURE_ROAD && (object.hits < (object.hitsMax * 0.80));
                        }
                    });
                    //console.log("notcrit", potentialTargets.length);
                    roadToRepair = creep.pos.findClosestByPath(potentialTargets);
                }
                
                //If target round, move near to/repair it
                if(roadToRepair){
                    if(!creep.pos.isNearTo(roadToRepair)){
                            creep.moveTo(roadToRepair);    
                    }
                        creep.repair(roadToRepair);
                }
                else{
                    //Move to room control, to just get out of the way and not crowd energy spot
                    if(!creep.pos.isNearTo(creep.room.controller))
                    {
                        creep.moveTo(creep.room.controller);
                    }
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

module.exports = roleForeignRoadRepairer;