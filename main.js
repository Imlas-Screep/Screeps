/*
 * Known things to work on:
 * Nothing is set to repair/fill containers
 * Nothing is set to use containers to keep towers topped off/in case of emergency
 * Need to possibly have foreignHarvesters fill containers, and have upgraders grab from that
 * Really really really need to fix tower code - should eventually also adjust priority
 * Should look into emergency safe-mode code. (When creeps die & enemy is in room? Need to detect creeps killed by enemy vs naturally)
 * Could also look into spawning a defender when enemy creeps detected. Maybe just a mass-heal creep (since invaders aren't high dps, could likely permatank)
 */

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleSmartHarvester = require('role.smartHarvester');
var roleSmartHarvester2 = require('role.smartHarvester2');
var roleRoadRepairer = require('role.roadRepairer');
var roleRoadRepairer2 = require('role.roadRepairer2');
var roleWallBuilder = require('role.wallBuilder');
var roleClaimer = require('role.claimer');
var roleForeignHarvester = require('role.foreignHarvester');
var roleForeignBuilder = require('role.foreignBuilder');
var roleForeignRoadRepairer = require('role.foreignRoadRepairer');
var roleAttacker = require('role.attacker');
var roleRepairer = require('role.repairer');

var friends = ['Ranamar', 'Picti', 'deltosan_kalnikov', 'reify', 'IcyMidnight', 'TheGreatMustashio', 'roflbox'];


function isFriendly(name){
    var i;
    for (i = 0; i < friends.length; i++){
        if(friends[i] === name) {
            return true;
        }
    }
    return false;
}


module.exports.loop = function () {
    
//    var creepOwnerName = 'ULA';
    //console.log("test:", isFriendly(creepOwnerName));
    
    var autoBuild = true;
    var sendReports = true;

    
    //Clean up dead creeps from memory
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            console.log('Clearing non-existing creep memory:', Memory.creeps[name].role, name, "RIP");
            delete Memory.creeps[name];
        }
    }
    

    //****************************************
    //New Smart-Spawn(tm) code starts here
    //First get a tally of all workers by type. This can be cleaned up later by making a list and adding workers/types to it when spawned and then deleting when they die (in memory clean-up)
    var minForeignHarvesters = 6;
    var minForeignBuilders = 0;
    var minWallRep = 1;
    var minRoadRep = 1;
    var minBuilders = 2;
    var minClaimers = 2;
    var minUpgraders = 2;
    var maxUpgraders = 15;
    var minUpgradersEmergency = 1;
    var minHarvesters = 8;
    var minHarvestersEmergency = 2;
    var minForeignRoadRep = 1;
    var minRepairers = 2;
    
    var allCreeps = _.filter(Game.creeps);
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'smartHarvester2');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var roadRepairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'roadRepairer');
    var wallBuilders = _.filter(Game.creeps, (creep) => creep.memory.role == 'wallBuilder');
    var foreignHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'foreignHarvester');
    var foreignBuilders = _.filter(Game.creeps, (creep) => creep.memory.role == 'foreignBuilder');
    var foreignRoadRepairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'foreignRoadRepairer');
    var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
    
    if(sendReports) {
        console.log('Autobuild:', autoBuild, 'Energy:', Game.rooms['W1N68'].energyAvailable, '/', Game.rooms['W1N68'].energyCapacityAvailable, ' TotalCreeps:', allCreeps.length, ' Harvesters:', harvesters.length, ' Upgraders:', upgraders.length,
                    ' Claimers:',claimers.length, ' Builders:', builders.length, ' RoadRepairers:', roadRepairers.length, ' WallBuilders:', wallBuilders.length,' ForeignHarvesters:', foreignHarvesters.length,
                    ' ForeignBuilders', foreignBuilders.length, ' ForeignRoadRep', foreignRoadRepairers.length, ' Repairers', repairers.length);
//        console.log('Energy: ' + Game.getObjectById('5837f1f4465957f661f1c052').room.energyAvailable +"/"+Game.getObjectById('5837f1f4465957f661f1c052').room.energyCapacityAvailable);
//        console.log(Game.rooms.W1N68.name, Game.rooms['W1N68'].name);
    }
    
    
    if (harvesters.length < minHarvestersEmergency){
        //Regardless of autoBuild, make some basic emergency workers
        var newName = Game.spawns['Imlaspawn'].createCreep([MOVE,WORK,CARRY], undefined, {role: 'smartHarvester2', needToFindSource: true, needToHarvest: false, needToFindDumpTarget: false, needToDump: false});
        console.log('Spawning new emergency harvester: ' + newName);
    } else if(upgraders.length < minUpgradersEmergency){
        //Similarly, make basic upgraders if needed
        var newName = Game.spawns['Imlaspawn'].createCreep([MOVE,WORK,CARRY], undefined, {role: 'upgrader'});
        console.log('Spawning new emergency upgrader: ' + newName);
    }
    
    //Conditionally, make workers up to the numerically listed amounts (defined above)
    //The actual spawn calls should be made into seperate easily-modifiable functions.... eventually
    if(autoBuild){
        if(harvesters.length < minHarvesters){
            var newName = Game.spawns['Imlaspawn'].createCreep([MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY], undefined, {role: 'smartHarvester2', needToFindSource: true, needToHarvest: false, needToFindDumpTarget: false, needToDump: false});
            console.log('Spawning new harvester: ' + newName);
        } else if(upgraders.length < minUpgraders){
            var newName = Game.spawns['Imlaspawn'].createCreep([MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY], undefined, {role: 'upgrader'});
            console.log('Spawning new upgrader: ' + newName);
        } else if(repairers.length < minRepairers){
            var newName = Game.spawns['Imlaspawn'].createCreep([WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'repairer', repairing: true, needToFindSource: true});
            console.log('Spawning new repairer: '+ newName)
        } else if(builders.length < minBuilders){
            var newName = Game.spawns['Imlaspawn'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'builder'});
            console.log('Spawning new builder: ' + newName);
        } else if(wallBuilders.length < minWallRep){
            var newName = Game.spawns['Imlaspawn'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'wallBuilder', needToFindEnergy: true, needToBuild: false});
            console.log('Spawning new wall crew: ' + newName);
        } else if(roadRepairers.length < minRoadRep){
            var newName = Game.spawns['Imlaspawn'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'roadRepairer', needToFindEnergy: true, needToRepair: false});
            console.log('Spawning new road crew: ' + newName);
        } else if(claimers.length < minClaimers){
            var newName = Game.spawns['Imlaspawn'].createCreep([CLAIM,MOVE,MOVE], undefined, {role: 'claimer', targetRoom: 'W1N67'});
            console.log('Spawning new claimer:', newName);
        }else if(foreignHarvesters.length < minForeignHarvesters){
            var newName = Game.spawns['Imlaspawn'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'foreignHarvester', homeRoom: 'W1N68', targetRoom: 'W1N67', targetPosX: 25, targetPosY: 1});
            console.log('Spawning new foreign harvester: ' + newName);
        }else if(foreignBuilders.length < minForeignBuilders){
            var newName = Game.spawns['Imlaspawn'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'foreignBuilder', targetRoom: 'W1N67', targetPosX: 25, targetPosY: 1});
            console.log('Spawning new foreign builder: ' + newName);
        }else if(foreignRoadRepairers.length < minForeignRoadRep){
            var newName = Game.spawns['Imlaspawn'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'foreignRoadRepairer', targetRoom: 'W1N67', targetPosX: 25, targetPosY: 1});
            console.log('Spawning new foreign road crew: ' + newName);
        }else{
            //Checks to find if everything is full on energy
            //Hard-coded atm to use the room that my main spawner is in
            var nonFullContainers = Game.rooms['W1N68'].find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER ) && structure.energy < structure.energyCapacity;
                }
            });
            //If everything is full on energy, spawn a new upgrader
            if(nonFullContainers.length == 0 && upgraders.length < maxUpgraders){
                var newName = Game.spawns['Imlaspawn'].createCreep([MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY], undefined, {role: 'upgrader'});
                console.log('Energy surpluss! Spawning new upgrader: ' + newName);
            }
        }

    }
    //End spawner code
    //********************
    
    
    
//Old spawner code    
/*
    var wallBuilders = _.filter(Game.creeps, (creep) => creep.memory.role == 'wallBuilder');
    //console.log('Harvesters: ' + harvesters.length);

    if(wallBuilders.length < 0 && autoBuild) {
        var newName = Game.spawns['Imlaspawn'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'wallBuilder', needToFindEnergy: true, needToBuild: false});
        console.log('Spawning new wall crew: ' + newName);
    }

    var roadRepairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'roadRepairer');
    //console.log('Harvesters: ' + harvesters.length);

    if(roadRepairers.length < 0 && autoBuild) {
        var newName = Game.spawns['Imlaspawn'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'roadRepairer', needToFindEnergy: true, needToRepair: false});
        console.log('Spawning new road crew: ' + newName);
    }
    
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    //console.log('Harvesters: ' + harvesters.length);

    if(builders.length < 2 && autoBuild) {
        var newName = Game.spawns['Imlaspawn'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'builder'});
        console.log('Spawning new builder: ' + newName);
    }
    
    var claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer');
    
    if(claimers.length < 0 && autoBuild) {
        var newName = Game.spawns['Imlaspawn'].createCreep([CLAIM,MOVE,MOVE], undefined, {role: 'claimer', targetID: '57ef9daa86f108ae6e60e1a9'});
        console.log('Spawning new claimer:', newName);
    }
    
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    //console.log('Harvesters: ' + harvesters.length);

    if(upgraders.length < 2 && autoBuild) {
        var newName = Game.spawns['Imlaspawn'].createCreep([MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY], undefined, {role: 'upgrader'});
        console.log('Spawning new upgrader: ' + newName);
    }
    
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'smartHarvester2');
    //console.log('Harvesters: ' + harvesters.length);
    
    if(harvesters.length < 2 && autoBuild) {
        var newName = Game.spawns['Imlaspawn'].createCreep([MOVE,WORK,CARRY], undefined, {role: 'smartHarvester2', needToFindSource: true, needToHarvest: false, needToFindDumpTarget: false, needToDump: false});
        console.log('Spawning new harvester: ' + newName);
    }

    if(harvesters.length < 8 && autoBuild) {
        var newName = Game.spawns['Imlaspawn'].createCreep([MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY], undefined, {role: 'smartHarvester2', needToFindSource: true, needToHarvest: false, needToFindDumpTarget: false, needToDump: false});
        console.log('Spawning new harvester: ' + newName);
    }
    
    */
    //OLD SPAWNER CODE END
    

    //Friend or Foe system

    //Sweet Jesus this needs to be cleaned up
    var tower = Game.getObjectById('583a521a56dc85ea0ccbcb64');
    if(tower) {
        /*
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }
        */


//        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);


        var hostileCreeps = tower.room.find(FIND_HOSTILE_CREEPS, {
                filter: (maybeHostileCreep) => {
                    return !isFriendly(maybeHostileCreep);
                }
        });
        var closestHostile = tower.pos.findClosestByRange(hostileCreeps);

        if(closestHostile) {
            tower.attack(closestHostile);
            console.log('Tower attacking', closestHostile.owner.username, closestHostile.pos, 'Size:', closestHostile.body.length, 'HP:', closestHostile.hits);
        } else{
            /*
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            if(closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            }
            */
        }
    }
    
    tower = Game.getObjectById('583dfb700502bf7c1e56ebd3');
    if(tower) {
        /*
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }
        */


//        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);


        var hostileCreeps = tower.room.find(FIND_HOSTILE_CREEPS, {
                filter: (maybeHostileCreep) => {
                    return !isFriendly(maybeHostileCreep);
                }
        });
        var closestHostile = tower.pos.findClosestByRange(hostileCreeps);

        if(closestHostile) {
            tower.attack(closestHostile);
            console.log('Tower attacking', closestHostile.owner.username, closestHostile.pos, 'Size:', closestHostile.body.length, 'HP:', closestHostile.hits);
        } else{
            /*
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            if(closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            }
            */
        }
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'smartHarvester') {
            roleSmartHarvester.run(creep);
        }
        if(creep.memory.role == 'smartHarvester2') {
            roleSmartHarvester2.run(creep);
        }
        if(creep.memory.role == 'roadRepairer') {
            roleRoadRepairer.run(creep);
        }
        if(creep.memory.role == 'roadRepairer2') {
            roleRoadRepairer2.run(creep);
        }
        if(creep.memory.role == 'wallBuilder') {
            roleWallBuilder.run(creep);
        }
        if(creep.memory.role == 'claimer') {
            roleClaimer.run(creep);
        }
        if(creep.memory.role == 'foreignHarvester') {
            roleForeignHarvester.run(creep);
        }
        if(creep.memory.role == 'foreignBuilder') {
            roleForeignBuilder.run(creep);
        }
        if(creep.memory.role == 'foreignRoadRepairer') {
            roleForeignRoadRepairer.run(creep);
        }
        if(creep.memory.role == 'attacker') {
            roleAttacker.run(creep);
        }
        if(creep.memory.role == 'repairer') {
            roleRepairer.run(creep);
        }
    }
    
    //console.log("NumConSites",Game.constructionSites.length)
//    for(var site in Game.constructionSites) {
  //      site.remove();
    //}
}