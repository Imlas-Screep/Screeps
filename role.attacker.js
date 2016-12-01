//Game.spawns['Imlaspawn'].createCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK], undefined, {role: 'attacker', targetRoom: 'W2N67', targetPosX: 48, targetPosY: 18});
//For use when there's no walls/defenses of any kind.
//Ideally would have logic to punch through walls/ramparts.

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

var roleAttacker = {

    /** @param {Creep} creep **/
    run: function(creep) { 
        if(creep.room.name != creep.memory.targetRoom){
            //The right way to do this would be to only run this block if the creep isn't in the target system *and* doesn't have a target. Requires storing target
            
            //Head to target room
            //This logic can be made way more CPU friendly by not constantly recomputing
//            var exitDir = Game.map.findExit(creep.room, creep.memory.targetRoom);
//            var exitLoc = creep.pos.findClosestByRange(exitDir);
//            creep.moveTo(exitLoc);

//            console.log(creep.name, exitDir, exitLoc);

            creep.moveTo(new RoomPosition(creep.memory.targetPosX, creep.memory.targetPosY, creep.memory.targetRoom));
        }
        else{
//            creep.moveTo(Game.flags['Flag2']);

            
            //Search for hostile creeps and attack
            var hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS, {
                    filter: (maybeHostileCreep) => {
                        return !isFriendly(maybeHostileCreep);
                    }
            });
            var closestHostile = creep.pos.findClosestByPath(hostileCreeps);
    
            if(closestHostile) {
                if(!creep.pos.isNearTo(closestHostile)){
                    creep.memory.targetHostile = closestHostile.id;
                    var moveReturn = creep.moveTo(closestHostile, {reusePath: 0});
//                    console.log('move attempt', moveReturn, closestHostile.pos.x, closestHostile.pos.y);
                }
                else{
                    var attackReturn = creep.attack(closestHostile);
                    console.log(creep.name, 'attacking', closestHostile.owner.username, closestHostile.pos, 'Size:', closestHostile.body.length, 'HP:', closestHostile.hits, 'returnCode:', attackReturn);
                }
            }
            else{
                //Search for hostile structures and attack
                var hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES, {
                    filter: (maybeHostileStructure) => {
                        return !isFriendly(maybeHostileStructure);
                    }
                });
                closestHostile = creep.pos.findClosestByPath(hostileStructures);
                
                if(closestHostile){
                    if(!creep.pos.isNearTo(closestHostile)){
                        creep.moveTo(closestHostile);
                    }
                    var attackReturn = creep.attack(closestHostile);
                    console.log(creep.name, 'attacking', closestHostile.owner.username, closestHostile.pos, 'Size:', 'HP:', closestHostile.hits, 'returnCode:', attackReturn);
                }
            }
        }

	}
};

module.exports = roleAttacker;