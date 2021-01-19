const env = {
    apiUrl: "https://pl-pl.openfoodfacts.org/api/v0/product/"
};

const errorMessages = {
    UNKNOWN_ERROR: "Nieznany błąd",
    BAD_EAN: "Niepoprawny kod EAN",
    BAD_INPUT: "Nazwa lub ilość produktu jest nieprawidłowa",
    CONNECT_ERROR: "Błąd połączenia z API: "
};

const textMessages = {
    EMPTY_PRODUCT_LIST: `
        Nie masz żadnych produktów na liście! 
        <img src='assets/undraw-empty-cart.svg' class='undraw-empty-cart'>
    `
};

const htmlElements = {
    modal: "#modalAddProduct",

    modal_header_text: "#modalAddProductLabel",

    modal_div_ean: "#modalFormEan",
    modal_div_manual: "#modalFormManual",

    modal_switch_to_ean: "#modalSwitchToEan",
    modal_switch_to_manual: "#modalSwitchToManual",
    modal_insert_debug_data: "#modalDebugData",

    modal_input_ean_ean: "#formEanEan",
    modal_input_ean_quantity: "#formEanQuantity",

    modal_input_manual_name: "#formManualName",
    modal_input_manual_quantity: "#formManualQuantity",

    modal_button_submit: "#addItem",
    modal_button_close: "#closeModal",

    modal_mode_inputs: "#modalInputs",
    modal_mode_ean_desc: "#modalEanDesc",

    modal_med_name: "#medName",
    modal_med_producer: "#medProducer",
    modal_med_container: "#medContainer",
    modal_med_quantity: "#medQuantity",
    modal_med_nutrions: "#medNutrions",

    modal_med_value_name: "#medNameVal",
    modal_med_value_quantity: "#medQuantityVal",
    modal_med_value_producer: "#medProducerVal",
    modal_med_value_container: "#medContainerVal",

    product_list: "#productList"
};

const debugEan = [
    {
        name: 'Ketchup Tortex',
        ean: 8712100601217
    },
    {
        name: 'Nałęczowianka 1L',
        ean: 5900635001364
    },
    {
        name: 'Delma',
        ean: 8719200022812
    },
    {
        name: 'Szynka Krakus',
        ean: 5900567015613
    },
    {
        name: 'Mleko - Mleczna Dolina',
        ean: 5900512320625
    },
    {
        name: 'Dżem Herbapol',
        ean: 5900956201009
    },
    {
        name: 'Majonez Kielecki',
        ean: 5900242001566
    },
    {
        name: 'Żywiecka',
        ean: 5900567012001
    },
    {
        name: "Jogobella",
        ean: 4014500021560
    },
    {
        name: "Jogurt pitny",
        ean: 5903767003657
    }
];


const formModal = new bootstrap.Modal(document.getElementById('modalAddProduct'), {
    keyboard: true
});


class Utils {
    static throwError(message) {
        alert(message);
    }

    static getApiUrl(ean) {
        return env.apiUrl + ean + '.json';
    }

    static objectLength(obj) {
        let size = 0;
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    }

    static capitalizeString(string) {
        if(typeof string != 'string') return '';
        if(string.length == 0) return '';
        let lastCharIndex = string.length - 1;
        if(string.charAt(lastCharIndex) == '.') string = string.slice(0, lastCharIndex);
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    static capitalizeLitre(string) {
        if(typeof string != 'string') return '';
        if(string.length == 0) return '';
        let indexOfUnit = string.search('l');
        if(indexOfUnit == -1) return string;
        if(string.charAt(indexOfUnit - 1) == 'm') return string;
        return string.slice(0, indexOfUnit) + string.charAt(indexOfUnit).toUpperCase() + string.slice(indexOfUnit + 1);
    }
}

class Valid {
    static isEan(ean) {
        if(ean == "" || isNaN(ean) || ean.length != 13) {
            return false;
        }

        return true;
    }

    static isProductInput(name, quantity) {
        if(name == "" || isNaN(quantity) || quantity < 1) {
            return false;
        }

        return true;
    }
}

class Product {
    constructor(name, quantity) {
        this.name = name;
        this.quantity = parseInt(quantity);
    }
}

class App {
    cache = {
        productList: new Array()
    }

    getProductData(ean, quantity) {
        if(!Valid.isEan(ean)) {
            Utils.throwError(errorMessages.BAD_EAN);
            return;
        }

        let url = Utils.getApiUrl(ean);
        axios.get(url)
        .then(res => {
            this.processProductData(res.data, quantity);
        })
        .catch(err => {
            Utils.throwError(errorMessages.CONNECT_ERROR);
            console.log(err);
        });

    }

    processProductData(data, quantity) {
        //Sprawdzanie czy API zwróciło istniejący produkt (0 - nie, 1 -tak)
        if(data.status == 0) {
            Utils.throwError(errorMessages.BAD_EAN);
            return;
        }


        let name = Utils.capitalizeString(data.product.product_name);
        let producer = data.product.brands || "";
        let container = Utils.capitalizeLitre(data.product.quantity) || "";
        let nutrient_levels = data.product.nutrient_levels;
        let nutriments = data.product.nutriments;

        //Zmiana HTML
        u(htmlElements.modal_med_value_name).first().value = name;
        u(htmlElements.modal_med_value_quantity).first().value = quantity;
        u(htmlElements.modal_med_value_producer).first().value = producer;
        u(htmlElements.modal_med_value_container).first().value = container;

        u(htmlElements.modal_med_name).html(name);
        u(htmlElements.modal_med_producer).html(producer);
        u(htmlElements.modal_med_container).html(container);
        u(htmlElements.modal_med_quantity).html("x" + quantity);

        if(Utils.objectLength(nutrient_levels) > 0) {
            const nutrions_list = u(htmlElements.modal_med_nutrions);
            nutrions_list.html('');

            for(const nutrient in nutrient_levels) {
                let nutrientLevel = nutriments[nutrient] + "g";
                let dotColor = "li-dot-";
                switch(nutrient_levels[nutrient]) {
                    case 'high':
                        dotColor += 'red';
                        break;
                    case 'moderate':
                        dotColor += 'yellow';
                        break;
                    case 'low':
                        dotColor += 'green';
                        break;
                    default:
                        dotColor += 'green';
                        break;
                }

                let htmlString = `<li class="${dotColor}">${nutrient} - ${parseFloat(nutrientLevel).toFixed(2) + 'g'}</li>`;
                nutrions_list.append(htmlString);
            }
        } 
        

        this.interface.modalSwitchTo(2);
    }    

    modalAction() {
        switch(this.interface.cache.modalMode) {
            case 0: //Ean
                let e_ean = u(htmlElements.modal_input_ean_ean).first().value;
                let e_quantity = u(htmlElements.modal_input_ean_quantity).first().value;
                this.getProductData(e_ean, e_quantity);
                break;
            case 1: //Manual
                let m_name = u(htmlElements.modal_input_manual_name).first().value;
                let m_quantity = u(htmlElements.modal_input_manual_quantity).first().value;
                this.addItemToList(m_name, m_quantity);
                break;
            case 2: //Ean desc
                let ed_name = u(htmlElements.modal_med_value_name).first().value;
                let ed_quantity = u(htmlElements.modal_med_value_quantity).first().value;
                let ed_producer = u(htmlElements.modal_med_value_producer).first().value;
                let ed_container = u(htmlElements.modal_med_value_container).first().value;
                ed_name += `, ${ed_container} (${ed_producer})`;

                this.addItemToList(ed_name, ed_quantity);

                formModal.hide();
                this.interface.modalSwitchTo(3);
                break;
            default:
                break;
        }
    }

    addItemToList(name, quantity) {
        if(!Valid.isProductInput(name, quantity)) {
            Utils.throwError(errorMessages.BAD_INPUT);
            return;
        }

        formModal.hide();
        this.interface.clearModalForms();

        let product = new Product(name, quantity);
        this.cache.productList.push(product);
        this.syncBrowserStorage();
    }

    deleteItemFromList(id) {
        this.cache.productList.splice(id, 1);
        this.syncBrowserStorage();
    }


    //Storage
    syncBrowserStorage() {
        let storageString = JSON.stringify(this.cache.productList);
        localStorage.setItem('productList', storageString);
        this.reloadList();
    }

    downloadBrowserData() {
        let storageSting = localStorage.getItem('productList');

        if(typeof storageSting == 'undefined' || storageSting == null) {
            this.reloadList();
            return;
        }

        let data = JSON.parse(storageSting);
        this.cache.productList = data;
        this.reloadList();
    }   

    reloadList() {
        const list = u(htmlElements.product_list);

        //Jeżeli lista jest pusta
        if(this.cache.productList.length == 0) {
            list.html(textMessages.EMPTY_PRODUCT_LIST);
            return;
        }

        list.html('');
        let i = 0;
        this.cache.productList.forEach(product => {
            let html = this.interface.getProductListHtmlElement(i, product.name, product.quantity);
            list.prepend(html);

            i++;
        });
    }

     


    
    interface = {
        cache: {
            modalMode: 0 //0 - EAN, 1 - Manual, 2 - EAN Desc
        },

        modalSwitchTo(mode) {
            //Czyszczenie inputów
            
            this.clearModalForms();

            switch(mode) {
                case 0: // EAN input
                    u(htmlElements.modal_div_manual).addClass('d-none');
                    u(htmlElements.modal_div_ean).removeClass('d-none');
                    this.cache.modalMode = 0;
                    break;
                case 1: //Manual input
                    u(htmlElements.modal_div_ean).addClass('d-none');
                    u(htmlElements.modal_div_manual).removeClass('d-none');
                    this.cache.modalMode = 1;
                    break;
                case 2: //EAN desc
                    u(htmlElements.modal_mode_inputs).addClass('d-none');
                    u(htmlElements.modal_mode_ean_desc).removeClass('d-none');
                    this.cache.modalMode = 2;
                    break;
                case 3: //Back to input mode
                    u(htmlElements.modal_mode_ean_desc).addClass('d-none');
                    u(htmlElements.modal_mode_inputs).removeClass('d-none');

                    u(htmlElements.modal_med_value_name).first().value = ""
                    u(htmlElements.modal_med_value_quantity).first().value = ""
                    u(htmlElements.modal_med_value_producer).first().value = ""

                    u(htmlElements.modal_med_name).html("");
                    u(htmlElements.modal_med_producer).html("");
                    u(htmlElements.modal_med_container).html("");
                    u(htmlElements.modal_med_quantity).html("");

                    this.cache.modalMode = 0;
                    break;
                default:
                    break;
            }
        },

        clearModalForms() {
            u(htmlElements.modal_input_manual_name).first().value = "";
            u(htmlElements.modal_input_manual_quantity).first().value = 1;

            u(htmlElements.modal_input_ean_ean).first().value = "";
            u(htmlElements.modal_input_ean_quantity).first().value = 1;
        },

        insertRandomDebugData() {
            let randomIndex = Math.floor(Math.random() * debugEan.length);
            let ean = debugEan[randomIndex].ean;
            let name = debugEan[randomIndex].name;
            u(htmlElements.modal_input_ean_ean).first().value = ean;
            console.log('Nazwa wylosowanego EAN: ', name);
        },

        getProductListHtmlElement(id, name, quantity) {
            const productListHtml = `
                <li class="list-group-item list-group-item-custom">
                    <div>
                        <span class="badge bg-success">x${quantity}</span>
                        <span>${name}</span>
                    </div>
                    <div class="list-group-item-icons">
                        <i class='bx bx-trash list-group-item-icon' name="${id}" onclick="app.deleteItemFromList(${id})"></i>
                    </div>
                </li>
            `;

            return productListHtml;
        },

        checkState() {
            if(this.cache.modalMode == 2) {
                this.modalSwitchTo(3);
            }
        }


    }

}
