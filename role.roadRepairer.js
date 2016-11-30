/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.roadRepairer');
 * mod.thing == 'a thing'; // true
 */

// Game.spawns['Imlaspawn'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'roadRepairer', needToFindEnergy: true, needToRepair: false});

var roleRoadRepairer = {
    run: function(creep) {
//        console.log(creep.name, creep.energy);
        if(creep.memory.needToFindEnergy) {
            //Get energy from spawn
            if(creep.carry.energy > 0){
                creep.memory.needToFindEnergy = false;
                creep.memory.needToRepair = true;
            }
            else{
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
            }
        }
        
        if(creep.memory.needToRepair) {
            if(creep.carry.energy == 0){
                creep.memory.needToFindEnergy = true;
                creep.memory.needToRepair = false;
            }
            else{
                var roadToRepair = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: function(object){
                        return object.structureType == STRUCTURE_ROAD && (object.hits < (object.hitsMax * 0.8));
                    }
                });
                
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

module.exports = roleRoadRepairer;