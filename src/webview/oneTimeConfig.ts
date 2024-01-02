import { LineNumbersUpdater } from "./code"
import { WebviewConfig, getSessionConfig, setSessionConfig } from "./configManager"
import { LockButtonUpdater, UIUpdater } from "./ui/updaters"
import { vscode } from "./util"

import {
    enableResizingInput,
    realLineNumbersInput,
    resetConfigButton,
    roundedCornersInput,
    roundingLevelSelect,
    saveConfigButton,
    showLineNumbersInput,
    showWindowControlsInput,
    showWindowTitleInput,
    shutterActionSelect,
    targetSelect,
    toggleLinkedButton,
    toggleLockedButton,
    transparentBackgroundInput
} from "./elements"

import { VarUpdater, VisibilityUpdater } from "./ui/updaters"

const biggerSelectWidth = `${targetSelect.getBoundingClientRect().width}px`

shutterActionSelect.style.width = biggerSelectWidth
roundingLevelSelect.style.width = biggerSelectWidth

function handleConfigBasedChange(input: HTMLInputElement, updater = UIUpdater) {
    return () => {
        const { configname } = input.dataset

        setSessionConfig({
            [configname as string]: input.checked
        })

        updater()
    }
}

export function addListeners() {
    showLineNumbersInput.addEventListener("change", handleConfigBasedChange(showLineNumbersInput, VarUpdater))
    realLineNumbersInput.addEventListener("change", handleConfigBasedChange(realLineNumbersInput, LineNumbersUpdater))

    showWindowTitleInput.addEventListener("change", handleConfigBasedChange(showWindowTitleInput, VisibilityUpdater))
    showWindowControlsInput.addEventListener("change", handleConfigBasedChange(showWindowControlsInput, VisibilityUpdater))

    roundedCornersInput.addEventListener("change", handleConfigBasedChange(roundedCornersInput, VarUpdater))
    transparentBackgroundInput.addEventListener("change", handleConfigBasedChange(transparentBackgroundInput))
    enableResizingInput.addEventListener("change", handleConfigBasedChange(enableResizingInput))

    shutterActionSelect.addEventListener("change", () => {
        setSessionConfig({
            shutterAction: shutterActionSelect.value as WebviewConfig["shutterAction"]
        })
    })

    targetSelect.addEventListener("change", () => {
        setSessionConfig({
            target: targetSelect.value as WebviewConfig["target"]
        })
    })

    roundingLevelSelect.addEventListener("change", () => {
        setSessionConfig({
            roundingLevel: Number(roundingLevelSelect.value) as WebviewConfig["roundingLevel"]
        })
        VarUpdater()
    })

    resetConfigButton.addEventListener("click", () => {
        vscode.postMessage({ type: "update-config" })
    })

    saveConfigButton.addEventListener("click", () => {
        vscode.postMessage({ type: "save-config", config: getSessionConfig() })
    })

    toggleLockedButton.addEventListener("click", () => {
        setSessionConfig({ isLocked: !getSessionConfig().isLocked })
        LockButtonUpdater()
    })

    toggleLinkedButton.addEventListener("click", () => {
        const isLinked = toggleLinkedButton.dataset.state === "linked"

        toggleLinkedButton.dataset.state = !isLinked ? "linked" : "unlinked"
        toggleLinkedButton.title = !isLinked ? "Broken Connection to editor" : "Connect to editor"

        setSessionConfig({
            isLinked: !isLinked
        })
    })
}