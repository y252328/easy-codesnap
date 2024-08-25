import * as vscode from "vscode";
import { extensionSettingsNames } from "../../constants";
import { getSettings } from "../../util";

export function getConfig() {
    const editorSettings = getSettings("editor", ["fontLigatures", "tabSize"]);

    const editor = vscode.window.activeTextEditor;
    if (editor) {
        editorSettings.tabSize = editor.options.tabSize;
    }

    const extensionSettings = getSettings(
        "cy-easy-codesnap",
        extensionSettingsNames,
    );

    const selection = editor?.selection;
    const startLine = selection ? selection.start.line : 0;

    let fileName = "";
    let filePath = "";
    if (editor) {
        const activeFilePaht = editor.document.uri.path;
        const activeFileName = activeFilePaht.split("/").pop();
        filePath = activeFilePaht as string;
        fileName = activeFileName as string;
    }

    return {
        ...editorSettings,
        ...extensionSettings,
        startLine,
        templates: {
            fileName,
            filePath,
            workspace: vscode.workspace.name ?? "",
        },
    };
}
