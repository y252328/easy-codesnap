import * as vscode from "vscode";
import { CodeSnapConfigNames } from "../constants";
import { Command } from "./Command";

export class ImportSettingsCommand extends Command {
    name = "cy-easy-codesnap.importSettings";

    exec() {
        const codesnapSettings = vscode.workspace.getConfiguration("cy-easy-codesnap");
        const extensionSettings =
            vscode.workspace.getConfiguration("cy-easy-codesnap");

        CodeSnapConfigNames.forEach((name) => {
            extensionSettings.update(
                name,
                codesnapSettings.get(name) ?? extensionSettings.get(name),
                vscode.ConfigurationTarget.Global,
            );
        });
    }
}
