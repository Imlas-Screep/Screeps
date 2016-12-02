var roleSmartHarvester2 = {

    /** @param {Creep} creep **/
    run: function(creep) {
/*        
        example spawn:
        Game.spawns['Imlaspawn'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'smartHarvester2', needToFindSource: true, needToHarvest: false, needToFindDumpTarget: false, needToDump: false});
        
        Used local variables: needToFindSource, needToHarvest, needToFindDumpTarget, needToDump, targetSourceID, targetDumpID
        
        
*/

        if(creep.memory.needToFindSource) {
            //Find a source (either picked at random or hard coded/etc)
            var sources = creep.room.find(FIND_SOURCES);
            creep.memory.targetSourceID = sources[0].id;
            //can eventually use next line to send harvester to random in-room patch
            //creep.memory.targetSourceID = sources[Math.floor(Math.random()*sources.length)].id;
            
            
            //Sets flags appropriately
            creep.memory.needToFindSource = false;
            creep.memory.needToHarvest = true;
        }
        
        if(creep.memory.needToHarvest) {
            //Head to targetDumpID, harvest if able
            if(creep.harvest(Game.getObjectById(creep.memory.targetSourceID)) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.targetSourceID));
            }
            
            //If full, quit harvesting and chose a dump site
            if(creep.carry.energy == creep.carryCapacity) {
                creep.memory.needToHarvest = false;
                creep.memory.needToFindDumpTarget = true;
            }
        }
        
        if(creep.memory.needToFindDumpTarget) {
            //Calculate possible dump targets, store one as targetDumpID
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (((structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN)  && structure.energy < structure.energyCapacity) ||
                            ((structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] < structure.storeCapacity))
                }
            });
            
            if(targets.length == 0) {
                //On the off-chance no targets are found, treat original spawn as target
                targets.push(Game.getObjectById('5837f1f4465957f661f1c052'));
            }
            
            if(targets.length > 0) {
               //creep.memory.targetDumpID = targets[0].id;
                creep.memory.targetDumpID = creep.pos.findClosestByRange(targets).id;
            }
            else{
                console.log("Something has gone horribly wrong with harvester logic.");
            }
            
            //Begin dumping/heading to targetDumpID
            creep.memory.needToFindDumpTarget = false;
            creep.memory.needToDump = true;
        }
        
        if(creep.memory.needToDump) {
            //Try to dump, capture errcodes
//            console.log('dumptarget', Game.getObjectById(creep.memory.targetDumpID));
            var xferResult = creep.transfer(Game.getObjectById(creep.memory.targetDumpID), RESOURCE_ENERGY);
//            console.log('result', xferResult);

            //If out of range, move closer
            if(xferResult == ERR_NOT_IN_RANGE){
//                console.log('out of range');
                //creep.moveTo(Game.getObjectById(creep.memory.targetDumpID),{reusePath:0});
                var moveResult = creep.moveTo(Game.getObjectById(creep.memory.targetDumpID),{reusePath:1});
//                console.log('moveResult',moveResult);
            } else if(xferResult == ERR_FULL && creep.carry.energy > 0){ //If targetDumpID is full and creep has energy>0, find new dump target (check return codes on the creep.transfer() )
                creep.memory.needToDump = false;
                creep.memory.needToFindDumpTarget = true;
            } else if(xferResult == OK && creep.carry.energy > 0){ //If xfer was OK and creep still has energy, find a new dump target
                creep.memory.needToDump = false;
                creep.memory.needToFindDumpTarget = true;
            } else { //Presumably everything went fine - find an energy source to huff
                creep.memory.needToDump = false;
                creep.memory.needToFindSource = true;
            }
        }
    }
};

module.exports = roleSmartHarvester2;
        
/*        
	    if(creep.carry.energy < creep.carryCapacity) {
//	    if(creep.carry.energy == 0) {
	        
	        if(creep.memory.needToFindSource == true) {
                var sources = creep.room.find(FIND_SOURCES);
                creep.memory.targetSourceID = sources[0].id;
                //can eventually use next line to send harvester to random in-room patch
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
                        console.log('time for fun');
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
*/



// Game.spawns['Imlaspawn'].createCreep([WORK,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'smartHarvester', needToFindSource: true});