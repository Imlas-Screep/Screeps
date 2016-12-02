/*
An extention/re-write of role.roadRepairer2. This will also repair all friendly non-wall structures.
It will also attempt to resupply towers from containers

*/

// Game.spawns['Imlaspawn'].createCreep([WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'repairer', repairing: true, needToFindSource: true});

var roleRepairer = {
    run: function(creep) {
        var CRIT_PERCENT = 0.25;
        var MODERATE_PERCENT = 0.75;
//        console.log(creep.name, creep.carry.energy);

        //First checks the creep's state and sets flags appropriately
        if(creep.carry.energy == 0 && creep.memory.repairing){
            //In this case, "repairing" also refers to moving energy
            creep.memory.repairing = false;
            creep.memory.scavenging = true;
            creep.say('Scavenging!');
        }
        if(creep.carry.energy > 0 && creep.memory.scavenging){
            creep.memory.repairing = true;
            creep.memory.scavenging = false;
            creep.say('Repairing!');
        }
        
        if(creep.memory.scavenging){
            //Creep will search for a nearby non-empty container or spawn and get energy
            //If nothing is found, head to room's controller (gets it out of the way)
            
            //First, we make sure that the creep will find a new repair target later
            creep.memory.needToFindTarget = true;
            
            //Attempts to only find a new source if it hasn't found one
            if(creep.memory.needToFindSource){
                var sources = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (((structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN)  && structure.energy < structure.energyCapacity) ||
                                ((structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] < structure.storeCapacity))
                    }
                });
                
                if(sources.length > 0){
                    creep.memory.targetSourceID = creep.pos.findClosestByPath(sources).id;
                    creep.memory.needToFindSource = false;
                }
                else{
                    creep.memory.targetSourceID = creep.room.controller.id;
                }
                
                
            }
            
            //Sets target source from targetID
            var targetSource = Game.getObjectById(creep.memory.targetSourceID);
            
            //The usual slightly-smarter moving/grabbing code
            if(!creep.pos.isNearTo(targetSource))
            {
                //Only attempts to move if it isn't nearby
                creep.moveTo(targetSource);
            }
            
            if(creep.pos.isNearTo(targetSource) && !creep.memory.needToFindSource){
                //Doesn't bother attempting to grab stuff if it isn't adjacent
                creep.withdraw(targetSource, RESOURCE_ENERGY);
                if(creep.carry.energy == 0){
                    //Creep tried to withdraw, but source was empty
                    creep.memory.needToFindSource = true;
                }
                else{
                    
                }
                
            }
            
            //Finally, if the source the creep was going for is empty, find a new one
            if(targetSource.energy == 0){
                creep.memory.needToFindSource = true;
            }
        }
        
        if(creep.memory.repairing){
            //Creep will, in order, attempt to fill towers, repair critically damaged structures (non-wall, non-road), repair any damaged structures, repair any critical roads, then repair any moderately damaged roads
            
            //First, we make sure that the creep will find a new source later
            creep.memory.needToFindSource = true;
            
            //Creep will search for a new repairTarget only if current one is fully healed
            //All of the below nested if-else statements can probably be chained better
            if(creep.memory.needToFindTarget){
                //First checks for towers
                var towers = creep.room.find(FIND_MY_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType ==  STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                        }
                    });
                    

                if(towers.length > 0){
                    //If there's a tower to re-fill, set the closest as the target
                    creep.memory.targetID = creep.pos.findClosestByPath(towers).id;
                    creep.memory.needToFindTarget = false;
                }
                else{
                    //Otherwise, check for critically damagned structures
                    var critTargets = creep.room.find(FIND_MY_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.hits < (structure.hitsMax * CRIT_PERCENT));
                        }
                    });
                    
                    if(critTargets.length > 0){
                        //If there's a critical target, set the closest
                        creep.memory.targetID = creep.pos.findClosestByPath(critTargets).id;
                        creep.memory.needToFindTarget = false;
                    }
                    else{
                        //ELSE - find non-crit target and repair it
                        var targets = creep.room.find(FIND_MY_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.hits < structure.hitsMax);
                            }
                        });
                        
                        if(targets.length > 0){
                            //If there's a target.etcetc
                            creep.memory.targetID = creep.pos.findClosestByPath(targets).id;
                            creep.memory.needToFindTarget = false;
                        }
                        else{
                            //EDIT - adding in containers under the 'find roads and repair' logic
                            //critRoads and modRoads will now include containers
                            //ELSE - find crit roads
                            var critRoads = creep.room.find(FIND_STRUCTURES, {
                                    filter: function(object){
                                    return (object.structureType == STRUCTURE_ROAD || object.structureType == STRUCTURE_CONTAINER) && (object.hits < (object.hitsMax * CRIT_PERCENT));
                                    }
                            });
                            
                            if(critRoads.length > 0){
                                creep.memory.targetID = creep.pos.findClosestByPath(critRoads).id;
                                creep.memory.needToFindTarget = false;
                            }
                            else{
                                //ELSE - find non-crit roads
                                var modRoads = creep.room.find(FIND_STRUCTURES, {
                                        filter: function(object){
                                        return (object.structureType == STRUCTURE_ROAD || object.structureType == STRUCTURE_CONTAINER) && (object.hits < (object.hitsMax * MODERATE_PERCENT));
                                        }
                                });
                                
                                if(modRoads.length > 0){
//                                    console.log('modRoads', modRoads);
                                    var targetRoad = creep.pos.findClosestByPath(modRoads);
//                                    console.log('targetRoad', targetRoad);
                                    if(targetRoad){
                                        creep.memory.targetID = creep.pos.findClosestByPath(modRoads).id;
                                        creep.memory.needToFindTarget = false;    
                                    }
                                    
                                }
                                else{
                                    //Keep searching for targets, space cowboy
                                    creep.memory.needToFindTarget = true;
                                }
                            }
                        }
                    }
                
                
                }
                
            }
            
            //If a target was found, set it by ID and do "things" to it
            if(!creep.memory.needToFindTarget){
                var target = Game.getObjectById(creep.memory.targetID);
                
                
                //Moves to target/repairs it/etc.
                if(!creep.pos.isNearTo(target)){
                    //Only attempts to move if it isn't nearby
                    creep.moveTo(target);
                }
                
                //Only attempt to do anything if near target
                if(creep.pos.isNearTo(target)){
                    //If the target is a non-full tower, re-fuel it
                    if(target.structureType == STRUCTURE_TOWER && target.energy < target.energyCapacity){
                        creep.transfer(target, RESOURCE_ENERGY);
                        //If target is full, find new target
                        if(target.energy == target.energyCapacity){
                            creep.memory.needToFindTarget = true;
                        }
                    }
                    else{
                        //Otherwise, repair it
                        creep.repair(target);
                        
                        //If target is full HP, find new target
                        if(target.hits == target.hitsMax){
                            creep.memory.needToFindTarget = true;
                        }
                    }
                }
            }
        }
    }
}

module.exports = roleRepairer;