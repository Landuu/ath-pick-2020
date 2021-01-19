
// Main app class init
const app = new App();


u(document).on('DOMContentLoaded', () => {
    app.downloadBrowserData();
})

u(htmlElements.modal_switch_to_manual).on('click', () => {
    app.interface.modalSwitchTo(1);
});

u(htmlElements.modal_switch_to_ean).on('click', () => {
    app.interface.modalSwitchTo(0);
});

u(htmlElements.modal_insert_debug_data).on('click', () => {
    app.interface.insertRandomDebugData();
});

u(htmlElements.modal_button_submit).on('click', () => {
    app.modalAction();
});

u(htmlElements.modal).on('hidden.bs.modal', () => {
    app.interface.checkState();
})