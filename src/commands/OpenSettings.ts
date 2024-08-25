import * as vscode from "vscode";
import { Command } from "./Command";

export class OpenSettingsCommand extends Command {
    name = "cy-easy-codesnap.openSettings";

    exec() {
        vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "@ext:CyH.cy-easy-codesnap",
        );
    }
}
