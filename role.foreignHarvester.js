//Game.spawns['Imlaspawn'].createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'foreignHarvester', homeRoom: 'W1N68', targetRoom: 'W1N67', targetPosX: 25, targetPosY: 1});

var roleForeignHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        //Carrying no energy, heading to target room
//        console.log(creep.carry.energy, creep.room.name, creep.memory.targetRoom);
        if(creep.carry.energy == 0 && creep.room.name != creep.memory.targetRoom){
            //There's probably a good way to get around using targetPosX and targetPosY
            creep.moveTo(new RoomPosition(creep.memory.targetPosX, creep.memory.targetPosY, creep.memory.targetRoom));
            creep.memory.needsToChooseSource = true;
        }
        
        //Not full on energy, in target room
        if(creep.carry.energy < creep.carryCapacity && creep.room.name == creep.memory.targetRoom){
            //Picks a random energy source if needed
            if(creep.memory.needsToChooseSource){
                var sources = creep.room.find(FIND_SOURCES);
                creep.memory.targetSourceID = sources[Math.floor(Math.random()*sources.length)].id;
                creep.memory.needsToChooseSource = false;
            }
            //Attempts to mine source, moves closer if out of range
            if(creep.harvest(Game.getObjectById(creep.memory.targetSourceID)) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.targetSourceID));
            }
        }
        
        //Full on eneergy, in target room
        if(creep.carry.energy == creep.carryCapacity && creep.room.name == creep.memory.targetRoom){
            creep.moveTo(new RoomPosition(Game.spawns['Imlaspawn'].pos.x, Game.spawns['Imlaspawn'].pos.y, Game.spawns['Imlaspawn'].room.name)); //Returns to spawn
            creep.memory.needToFindDumpTarget = true;
        }
        
        //Has energy, back in home room
        if(creep.carry.energy > 0 && creep.room.name == Game.spawns['Imlaspawn'].room.name){
            if(creep.memory.needToFindDumpTarget) {
                //Calculate possible dump targets, store one as targetDumpID
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER ) && structure.energy < structure.energyCapacity;
                    }
                });
                
                if(targets.length == 0) {
                    //On the off-chance no targets are found, treat original spawn as target
                    targets.push(Game.spawns['Imlaspawn']);
                }
                
                if(targets.length > 0) {
                    //Uses ByRange instead of ByPath to save on cpu
                    creep.memory.targetDumpID = creep.pos.findClosestByRange(targets).id;
                }
                else{
                    console.log("Something has gone horribly wrong with harvester logic.");
                }
                
                //Begin dumping/heading to targetDumpID
                creep.memory.needToFindDumpTarget = false;
                creep.memory.needToDump = true;
            }
            
        }
        
        if(creep.memory.needToDump){
            //Try to dump, capture errcodes
            var xferResult = creep.transfer(Game.getObjectById(creep.memory.targetDumpID), RESOURCE_ENERGY);
//            console.log(xferResult);

            //If out of range, move closer
            if(xferResult == ERR_NOT_IN_RANGE){
                creep.moveTo(Game.getObjectById(creep.memory.targetDumpID));
            } else if(xferResult == ERR_FULL && creep.carry.energy > 0){ //If targetDumpID is full and creep has energy>0, find new dump target (check return codes on the creep.transfer() )
                creep.memory.needToDump = false;
                creep.memory.needToFindDumpTarget = true;
            } else if(xferResult == OK && creep.carry.energy > 0){ //If xfer was OK and creep still has energy, find a new dump target
                creep.memory.needToDump = false;
                creep.memory.needToFindDumpTarget = true;
            } else { //Presumably everything went fine - carry on huffing
                creep.memory.needToDump = false;
            }
        }
	}
};

module.exports = roleForeignHarvester;