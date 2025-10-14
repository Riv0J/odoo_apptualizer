console.log("✅ content.js cargado");
const config = null;
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {

    let config = await chrome.storage.local.get(null);
    console.log(config);
    
    switch (request.action) {
        case "save_module_name":
            message("Módulo guardado: "+config['module_name']);
            break;
        case "apptualizar":
            console.log("📩 Mensaje recibido: Ejecutando content.js");

            if(!is_odoo()){
                return message("No es un sitio de odoo", false);
            }
            
            if(!config['module_name']){
                return message("‼ Error obteniendo el nombre de módulo guardado", false);
            }

            await app_menu();
            await app_search(config['module_name']);
            await app_update();
            // await app_update_animation();

            sendResponse({ status: "ok" });
        default:
            // message("Elemento no encontrado", false);
            break;
    }
});

function is_odoo(){
    return document.querySelector("[data-odoo]");
}
async function app_menu() {
    //if user is in form menu, click cancel changes
    document.querySelector(".o_form_button_cancel")?.click();

    //if apps menu is visible, click it
    document.querySelector(".o_navbar_apps_menu button")?.click();

    message('Entrando a Apps...');
    await click('[data-menu-xmlid="base.menu_management"]')
}
async function app_search(name) {
    await click('.o_facet_remove');
    await search('.o_searchview_input', name);
}
async function app_update() {
    click('.o_dropdown_kanban button');

    if(await click('[name="button_immediate_upgrade"]')){
        message(`Actualizando`, true);
    }
}
async function click(selector) {
    try {
        const element = await waitForElement(selector);

        interact(element);
        sleep(3000);
        element.click();
        interact(element, true);

        console.log(`🖱️ Click en ${selector}`);
        message(`🖱️ Click en ${selector}`);
    } catch (error) {
        console.error(error);
        message(`❌ No se pudo hacer clic en "${selector}": ${error}`);
    }
}

function interact(e, remove=false){
    if(remove === true){
        e.style.boxShadow = '';
    } else {
        Object.assign(e.style, {
            boxShadow: '0 5px 10px 10px rgba(255, 0, 0, 0.95)',
        });
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

function message(msg = "⚠️ Error al hacer clic en el elemento.", status) {
    // Asegura que el body tenga position: relative
    document.body.style.position = 'relative';
    
    // Crea el contenedor si no existe
    let container = document.getElementById('message-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'message-container';
        container.style.position = 'absolute';
        container.style.inset = '0';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    
    // Crea el mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.textContent = msg;
    
    const color = status === true ? '#e0ffc9'
    : status === false
    ? '#ff9e9eff'
    : '#ffe386ff';

    // Estilos del mensaje
    Object.assign(messageDiv.style, {
        background: color,
        color: '#222',
        padding: '10px 20px',
        borderRadius: '6px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        fontFamily: 'sans-serif',
        fontSize: '14px',
        pointerEvents: 'auto',
    });
    
    // Limpia mensajes previos
    container.innerHTML = '';
    container.appendChild(messageDiv);
    
    // Opcional: eliminar después de unos segundos
    setTimeout(() => {
        container.remove();
    }, 3000);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}