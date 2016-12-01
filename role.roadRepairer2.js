/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.roadRepairer');
 * mod.thing == 'a thing'; // true
 */

// Game.spawns['Imlaspawn'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'roadRepairer2', needToFindEnergy: true, needToRepair: false});

var roleRoadRepairer2 = {
    run: function(creep) {
//        console.log(creep.name, creep.energy);
        if(creep.memory.needToFindEnergy) {
            //Get energy from spawn
            if(creep.carry.energy > 0){
                creep.memory.needToFindEnergy = false;
                creep.memory.needToRepair = true;
            }
            else{
                    var sources = creep.room.find(FIND_SOURCES);
                    if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources[1]);
                    }
                
                //Scrapping a "take it from the spawn" approach in favor of just self-mining needed energy
                /*
                var spawn = Game.spawns['Imlaspawn'];
                //var spawn = creep.room.find(FIND_MY_SPAWNS)[0];
                //console.log(creep.name, creep.room.name, spawn.name);
                
                if(spawn.energy > 200){
                    var withdrawResult = creep.withdraw(spawn, RESOURCE_ENERGY);
                    if(withdrawResult == ERR_NOT_IN_RANGE){
                        creep.moveTo(spawn)
                    } else if(withdrawResult == OK){
                        creep.memory.needToFindEnergy = false;
                        creep.memory.needToRepair = true;
                    }
                }
                */
            }
        }
        
        if(creep.memory.needToRepair) {
            if(creep.carry.energy == 0){
                creep.memory.needToFindEnergy = true;
                creep.memory.needToRepair = false;
            }
            else{
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
                
            }

        }
    }
        
        
}

module.exports = roleRoadRepairer2;