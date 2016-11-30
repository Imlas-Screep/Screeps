var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.carry.energy < creep.carryCapacity) {
            var sources = creep.room.find(FIND_SOURCES);
            //console.log('num sources: ' + sources.length + " " + creep.name);
            //console.log('x: ' + sources[0].pos.x + " y: " + sources[0].pos.y)
            if(sources.length>1){
                if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[1]);
                }
            }
            else{
                if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
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
            }
        }
	}
};

module.exports = roleHarvester;

/*
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            var closestHostile = tower.room.find(FIND_HOSTILE_CREEPS, {
                    filter: (maybeHostileCreep) => {
                        return isFriendly(maybeHostileCreep);
                    }
            });
*/