import { system, BlockPermutation, world } from "@minecraft/server";
import { DirectionType } from './utils/helper';
import { directionToVector3 } from './utils/math';

const NONSOLID = [
    "minecraft:air",
    "minecraft:water",
    "minecraft:lava",
    "minecraft:fire",
    "minecraft:torch",
    "minecraft:wall_torch",
    "minecraft:ladder",
    "minecraft:vine",
    "minecraft:grass",
    "minecraft:tallgrass",
    "minecraft:seagrass",
    "minecraft:kelp",
    "minecraft:snow_layer"
];

function isSolid(block) {
    if (!block) return false;
    return !NONSOLID.includes(block.typeId);
}

function updateFenceConnections(block) {
    if (!block || !block.typeId.startsWith("morefences:") || !block.typeId.endsWith("_fence")) return;
    let states = {};
    for (const direction of DirectionType.HORIZONTAL) {
        const offset = directionToVector3(direction);
        const neighbor = block.offset(offset);
        states[`morefences:${direction.toLowerCase()}`] = isSolid(neighbor);
    }
    try {
        block.setPermutation(block.permutation.withStates(states));
    } catch (e) {}
}

system.beforeEvents.startup.subscribe(init => {
    init.blockComponentRegistry.registerCustomComponent("morefences:trigger", {
        beforeOnPlayerPlace: e => {
            for (const direction of DirectionType.HORIZONTAL) {
                const offset = directionToVector3(direction);
                const neighbor = e.block.offset(offset);
                e.permutationToPlace = e.permutationToPlace.withState(
                    `morefences:${direction.toLowerCase()}`,
                    isSolid(neighbor)
                );
            }
        },
        onNeighborChanged: e => {
            updateFenceConnections(e.block);
            for (const direction of DirectionType.HORIZONTAL) {
                const offset = directionToVector3(direction);
                const neighbor = e.block.offset(offset);
                updateFenceConnections(neighbor);
            }
        }
    });
});

world.afterEvents.blockPlace.subscribe(ev => {
    world.sendMessage("Block placed at " + JSON.stringify(ev.block.location));
});

// // Update fences when any block is placed or broken
// world.afterEvents.blockPlace.subscribe(event => {
//     // Update all adjacent fences (if any)
//     for (const direction of DirectionType.HORIZONTAL) {
//         const offset = directionToVector3(direction);
//         const neighbor = event.block.offset(offset);
//         updateFenceConnections(neighbor);
//     }
//     // Also update the placed block if it's a fence
//     updateFenceConnections(event.block);
// });

// world.afterEvents.blockBreak.subscribe(event => {
//     // Update all adjacent fences (if any)
//     for (const direction of DirectionType.HORIZONTAL) {
//         const offset = directionToVector3(direction);
//         const neighbor = event.block.offset(offset);
//         updateFenceConnections(neighbor);
//     }
// });