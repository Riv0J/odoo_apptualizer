console.log("✅ background.js cargado");

chrome.commands.onCommand.addListener(async (command) => {
    if (command === "apptualizar") {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tab?.id) {
            chrome.tabs.sendMessage(tab.id, { action: "apptualizar" });
        }
    }
});
