document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get("module_name", (result) => {
        if (chrome.runtime.lastError) {
            console.error("❌ Error al leer module name:", chrome.runtime.lastError.message);
            document.querySelector("#module-name").value = "lekuona_custom_devs";
            
        } else if (result.module_name) {
            document.querySelector("#module-name").value = result.module_name;
            console.log("✅ Module name cargado en el input:", result.module_name);
        }
    });

    chrome.storage.local.get("update_count", (result) => {
        if (chrome.runtime.lastError) {
            console.error("❌ Error al leer update_count:", chrome.runtime.lastError.message);
            document.querySelector("#update-count").textContent = 0;
            
        } else if (result.update_count) {
            document.querySelector("#update-count").textContent = " "+result.update_count;
        }
    });
});

document.getElementById("run-update").addEventListener("click", async () => {
    const module_name = document.querySelector('input[name="module-name"]').value;

    chrome.storage.local.set({ module_name: module_name }, async () => {
        if (chrome.runtime.lastError) {
            console.error("❌ Error al guardar el module name:", chrome.runtime.lastError.message);
        } else {
            console.log("✅ Module name guardado:", module_name);
            await send_message('save_module_name');
            send_message("apptualizar");
        }
    });
});

async function send_message(action){
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: action }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("❌ Error al enviar mensaje:", chrome.runtime.lastError.message);
        } else {
            console.log("✅ Respuesta del content script:", response);
        }
    });
}