import { homedir } from "os"
import path from "path"
import * as vscode from "vscode"
import { importSettings } from "./commands/importSettings"
import { extensionSettingsNames } from "./constants"
import { createStatusbarButton } from "./statusBarButton"
import { getSettings, readHtml, writeFile } from "./util"

const getConfig = () => {
	const editorSettings = getSettings("editor", ["fontLigatures", "tabSize"])

	const editor = vscode.window.activeTextEditor
	if (editor) { editorSettings.tabSize = editor.options.tabSize }

	const extensionSettings = getSettings("easy-codesnap", extensionSettingsNames)

	const selection = editor?.selection
	const startLine = selection ? selection.start.line : 0

	let windowTitle = ""
	if (editor) {
		const activeFileName = editor.document.uri.path.split("/").pop()
		windowTitle = `${vscode.workspace.name} - ${activeFileName}`
	}

	return {
		...editorSettings,
		...extensionSettings,
		startLine,
		windowTitle
	}
}

const createPanel = async (context: vscode.ExtensionContext) => {
	const panel = vscode.window.createWebviewPanel(
		"easy-codesnap",
		"Easy CodeSnap 📸",
		{ viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
		{
			enableScripts: true,
			localResourceRoots: [vscode.Uri.file(context.extensionPath)]
		}
	)

	panel.webview.html = await readHtml(
		path.resolve(context.extensionPath, "webview/index.html"),
		panel,
		context
	)

	return panel
}

let lastUsedImageUri = vscode.Uri.file(path.resolve(homedir(), "Desktop/code.png"))
const saveImage = async (data: string) => {
	const uri = await vscode.window.showSaveDialog({
		filters: { Images: ["png"] },
		defaultUri: lastUsedImageUri
	})

	lastUsedImageUri = uri as vscode.Uri

	if (uri) {
		writeFile(uri.fsPath, Buffer.from(data, "base64")).then(() => {
			vscode.window.showInformationMessage(`Image saved on: ${uri.fsPath}`)
		})
	}
}

const hasOneSelection = (selections: readonly vscode.Selection[]) =>
	selections && selections.length === 1 && !selections[0].isEmpty

const runCommand = async (context: vscode.ExtensionContext) => {
	const panel = await createPanel(context)

	const update = async (updateType: "config" | "text" | "both") => {
		await vscode.commands.executeCommand("editor.action.clipboardCopyWithSyntaxHighlightingAction")
		panel.webview.postMessage({
			type: updateType === "both" ? "update" : `update-${updateType}`,
			...getConfig()
		})
	}

	const flash = () => panel.webview.postMessage({ type: "flash" })

	panel.webview.onDidReceiveMessage(async ({ type, data, config }) => {
		switch (type) {
			case "save":
				flash()
				await saveImage(data)
				break
			case "copied":
				vscode.window.showInformationMessage("Image copied to clipboard!")
				break
			case "update-config":
				update("config")
				break
			case "save-config":
				const extensionSettings = vscode.workspace.getConfiguration("easy-codesnap")

				extensionSettingsNames.forEach((name) => {
					if (name in config && extensionSettings.get(name) !== config[name]) {
						extensionSettings.update(
							name,
							config[name],
							vscode.ConfigurationTarget.Global
						)
					}
				})

				vscode.window.showInformationMessage("Settings saved as default!")

				break
			case "ready":
				const editor = vscode.window.activeTextEditor
				if (editor && hasOneSelection(editor.selections)) { update("both") }
				break
			default:
				vscode.window.showErrorMessage(`Easy CodeSnap 📸: Unknown shutterAction "${type}"`)
				break
		}
	})

	const selectionHandler = vscode.window.onDidChangeTextEditorSelection(
		(e) => hasOneSelection(e.selections) && update("text")
	)
	panel.onDidDispose(() => selectionHandler.dispose())
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand("easy-codesnap.snap", () => runCommand(context)),
		vscode.commands.registerCommand("easy-codesnap.importSettings", importSettings),
		createStatusbarButton()
	)
}

export function deactivate() { }
