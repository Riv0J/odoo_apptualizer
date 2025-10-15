console.log("✅ content.js cargado");
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    const config = await chrome.storage.local.get(null);
    // console.log(config);
    
    switch (request.action) {
        case "save_module_name":
            message("Módulo guardado: "+config['module_name'], "success");
            break;
        case "apptualizar":
            console.log("📩 Mensaje recibido: Ejecutando content.js");

            if(!is_odoo()){
                return message("No es un sitio de odoo", "error");
            }
            
            if(!config['module_name']){
                return message("Error obteniendo el nombre de módulo guardado", "error");
            }

            await app_menu();
            await app_search(config['module_name']);
            await app_update();

            const count = !config.update_count ? 1 : config.update_count+1;
            console.log(count);
            chrome.storage.local.set({update_count: count});

            sendResponse({ status: "ok" });
        default:
            break;
    }
});

function is_odoo(){
    return document.querySelector("[data-odoo]") || document.querySelector('.o_navbar');
}
async function app_menu() {
    //if user is in form menu, click cancel changes
    document.querySelector(".o_form_button_cancel")?.click();

    //if apps menu is visible, click it
    document.querySelector(".o_navbar_apps_menu button")?.click();

    //click on apps
    message('Entrando a Apps...');
    await click('[data-menu-xmlid="base.menu_management"]')
}
async function app_search(name) {
    await click('.o_facet_remove');
    await search('.o_searchview_input', name);
}
async function app_update() {
    await click('.o_dropdown_kanban button');

    const e = await waitForElement('[name="button_immediate_upgrade"]');
    if(e){
        app_update_animation();
        e.click();
    }
}
async function click(selector) {
    try {
        const element = await waitForElement(selector);
        element.click();
        console.log(`🖱️ Click en ${selector}`);
        message(`🖱️ Click en ${selector}`);
    } catch (error) {
        console.error(error);
        message(`❌ No se pudo hacer clic en "${selector}": ${error}`, "error");
    }
}

// Espera a que un elemento esté disponible y luego hace clic
function waitForElement(selector, timeout = 15000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                resolve(element);
            } else if (Date.now() - start > timeout) {
                clearInterval(interval);
                reject(`❌ Elemento "${selector}" no encontrado después de ${timeout / 1000}s`);
            } else {
                console.log(`⏳ Esperando ${selector}...`);
            }
        }, 500);
    });
}

async function search(selector, text) {
    try {
        const input = await waitForElement(selector);
        input.value = text;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        console.log(`🔍 Buscando la app: ${text}`);
    } catch (error) {
        console.error(error);
    }
}

function message(text, status="normal") {
    // Crea el contenedor si no existe
    let container = document.querySelector('#apptualizer-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'apptualizer-container';
        document.body.appendChild(container);
    }
    
    // Crea el mensaje
    const message = document.createElement('div');
    message.className = 'apptualizer-message '+status;
    message.textContent = text;
    
    // Limpia mensajes previos
    container.innerHTML = '';
    container.appendChild(message);
    setTimeout(() => {
        message.remove();
    }, 3000);
}
function app_update_animation(){
    document.querySelector('#apptualizer-container').innerHTML = "";

    const loading = document.createElement('div');
    loading.id = 'apptualizer-loading';
    loading.className = 'apptualizer-message'
    const icons = "♥♠♣♦○";
    loading.innerHTML = `<span>${icons[Math.floor(Math.random() * icons.length)]}</span>`;

    document.querySelector('#apptualizer-container').appendChild(loading);
}
// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }