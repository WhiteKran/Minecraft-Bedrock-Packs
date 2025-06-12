import { world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

world.afterEvents.playerInteractWithBlock.subscribe(ev => {
    const block = ev.block;
    const player = ev.player;
    if (block.typeId === "woodcutter:woodcutter") {
        const form = new ActionFormData()
            .title("Woodcutter")
            .body("Custom woodcutter UI goes here.")
            .button("OK");
        form.show(player);
        ev.cancel = true;
    }
});