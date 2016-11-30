var roleSmartHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.carry.energy < creep.carryCapacity) {
//	    if(creep.carry.energy == 0) {
	        
	        if(creep.memory.needToFindSource == true) {
                var sources = creep.room.find(FIND_SOURCES);
                creep.memory.targetSourceID = sources[0].id;
//                creep.memory.targetSourceID = sources[Math.floor(Math.random()*sources.length)].id;
//                console.log(creep.name, "x:", Game.getObjectById(creep.memory.targetSourceID).pos.x, "y:", Game.getObjectById(creep.memory.targetSourceID).pos.y);
                creep.memory.needToFindSource = false;
                creep.moveTo(Game.getObjectById(creep.memory.targetSourceID)) //begins moving to newly chosen source
                
	        }
	        else {
	            if(creep.harvest(Game.getObjectById(creep.memory.targetSourceID)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.targetSourceID));
	            }
	        }
	    }

        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
            });
            if(targets.length == 0) {
                targets.push(Game.getObjectById('5837f1f4465957f661f1c052'));
            }
            else {
               // console.log("I found home!");
            }
            
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
                else {
                    creep.say('Done xfering. Choosing new source.');
                    if(creep.carry.energy == 0) {
                        creep.memory.needToFindSource = true;
                    }
                    else {
//                        console.log('time for fun');
                        var targets = creep.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_EXTENSION ||
                                    structure.structureType == STRUCTURE_SPAWN ||
                                    structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                            }
                        });
                        
                        if(targets.length > 0) {
                            if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(targets[0]);
                            }
                        }
                    }
                    
                }
            }
        }
	}
};

module.exports = roleSmartHarvester;

// Game.spawns['Imlaspawn'].createCreep([WORK,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'smartHarvester', needToFindSource: true});