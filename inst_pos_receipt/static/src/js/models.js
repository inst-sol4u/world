odoo.define('inst_pos_receipt.models', function (require) {
    "use strict";

var { Order, Orderline } = require('point_of_sale.models');
const Registries = require('point_of_sale.Registries');

const InstPosReceiptOrder = (Order) => class InstPosReceiptOrder extends Order {
    export_for_printing() {
        const receipt = super.export_for_printing(...arguments);
        let company = this.pos.company;
        receipt.company.street = company.street;
        receipt.company.street2 = company.street2;
        receipt.company.city = company.city;
        receipt.company.state = company.state_id[1];
        receipt.company.country = company.country_id[1];
        return receipt;
    }
}
Registries.Model.extend(Order, InstPosReceiptOrder);

const InstPosReceiptOrderline = (Orderline) => class InstPosReceiptOrderline extends Orderline {
    export_for_printing() {
        const receipt = super.export_for_printing(...arguments);
        receipt.price_display_one_without_tax = this.get_unit_price();
        return receipt;
    }
}
Registries.Model.extend(Orderline, InstPosReceiptOrderline);

});