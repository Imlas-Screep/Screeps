/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.roadRepairer');
 * mod.thing == 'a thing'; // true
 */

// Game.spawns['Imlaspawn'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'roadRepairer', needToFindEnergy: true, needToRepair: false});

var roleWallBuilder = {
    run: function(creep) {
//        console.log(creep.name, creep.energy);
        if(creep.memory.needToFindEnergy) {
            //Get energy from spawn
            if(creep.carry.energy == creep.carryCapacity){
                creep.memory.needToFindEnergy = false;
                creep.memory.needToBuild = true;
            }
            else{
                var sources = creep.room.find(FIND_SOURCES);
                if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[1]);
                }
                /*
                var spawn = creep.room.find(FIND_MY_SPAWNS)[0];
    //            console.log(creep.name, creep.room.name, spawn.name);
                
                if(spawn.energy > 200){
                    var withdrawResult = creep.withdraw(spawn, RESOURCE_ENERGY);
                    if(withdrawResult == ERR_NOT_IN_RANGE){
                        creep.moveTo(spawn)
                    } else if(withdrawResult == OK){
                        creep.memory.needToFindEnergy = false;
                        creep.memory.needToBuild = true;
                    }
                }
                */
            }
        }
        
        if(creep.memory.needToBuild) {
            if(creep.carry.energy == 0){
                creep.memory.needToFindEnergy = true;
                creep.memory.needToBuild = false;
            }
            else{
                //Need to modify such that it's only finding a new thing to rep when the old one isn't valid. The current method is munching through obscene amounts of cpu
                var wallToBuild = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: function(object){
                        return object.structureType == STRUCTURE_WALL && (object.hits < (object.hitsMax * 0.005));
                    }
                });
                
                if(wallToBuild){
                    if(!creep.pos.isNearTo(wallToBuild)){
                        creep.moveTo(wallToBuild);    
                    }
                    creep.repair(wallToBuild);
                }
            }

        }
    }
        
        
}

module.exports = roleWallBuilder;