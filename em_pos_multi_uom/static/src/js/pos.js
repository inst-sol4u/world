odoo.define('em_pos_multi_uom', function (require) {
"use strict";
    const PosComponent = require('point_of_sale.PosComponent');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const { useListener } = require("@web/core/utils/hooks");
    const Registries = require('point_of_sale.Registries');
    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');
    const PosDB = require('point_of_sale.DB');
    const { PosGlobalState, Orderline } = require('point_of_sale.models');
    var utils = require('web.utils');

var round_di = utils.round_decimals;
var round_pr = utils.round_precision;

    const MultiUomPosGlobalState = (PosGlobalState) => class MultiUomPosGlobalState extends PosGlobalState {
        async _processData(loadedData) {
             await super._processData(...arguments);
            if (this.config.allow_multi_uom) {
                this.em_uom_list = loadedData['product.multi.uom'];
            }
        }
    }
    Registries.Model.extend(PosGlobalState, MultiUomPosGlobalState);

    PosDB.include({
        init: function(options){
            var self = this;
            this._super(options);
        },
        add_products: function(products){
            var self = this;
            this._super(products); 
            
            for(var i = 0, len = products.length; i < len; i++){
                var product = products[i];
                if(product.has_multi_uom && product.multi_uom_ids){
                    var barcode_list = $.parseJSON(product.new_barcode);
                    for(var k=0;k<barcode_list.length;k++){
                        this.product_by_barcode[barcode_list[k]] = product;
                    }
                }
            }
        },
    });

    const PosResProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            async _barcodeProductAction(code) {

            let product = this.env.pos.db.get_product_by_barcode(code.base_code);
            var temp = true;
            if (!product) {
                // find the barcode in the backend
                let foundProductIds = [];
                try {
                    foundProductIds = await this.rpc({
                        model: 'product.product',
                        method: 'search',
                        args: [[['barcode', '=', code.base_code]]],
                        context: this.env.session.user_context,
                    });
                } catch (error) {
                    if (isConnectionError(error)) {
                        return this.showPopup('OfflineErrorPopup', {
                            title: this.env._t('Network Error'),
                            body: this.env._t("Product is not loaded. Tried loading the product from the server but there is a network error."),
                        });
                    } else {
                        throw error;
                    }
                }
                if (foundProductIds.length) {
                    await this.env.pos._addProducts(foundProductIds);
                    // assume that the result is unique.
                    product = this.env.pos.db.get_product_by_id(foundProductIds[0]);
                } else {
                    return this._barcodeErrorAction(code);
                }
            }

            const options = await this._getAddProductOptions(product, code);
            // Do not proceed on adding the product when no options is returned.
            // This is consistent with _clickProduct.
            if (!options) return;

            // update the options depending on the type of the scanned code
            if (code.type === 'price') {
                Object.assign(options, {
                    price: code.value,
                    extras: {
                        price_manually_set: true,
                    },
                });
            } else if (code.type === 'weight') {
                Object.assign(options, {
                    quantity: code.value,
                    merge: false,
                });
            } else if (code.type === 'discount') {
                Object.assign(options, {
                    discount: code.value,
                    merge: false,
                });
            }
            
            var pos_multi_op = this.env.pos.em_uom_list;
            var is_multi_uom = false;
            var unit_price = 0;
            for(var i=0;i<pos_multi_op.length;i++){
                if(pos_multi_op[i].barcode == code.base_code){
                    unit_price = pos_multi_op[i].price;
                    is_multi_uom = true;
                    Object.assign(options, {
                        price: pos_multi_op[i].price,
                        extras: {
                            wvproduct_uom: this.env.pos.units_by_id[pos_multi_op[i].multi_uom_id[0]],
                        },
                    });
                }
            }
            this.currentOrder.add_product(product,  options)
            if(is_multi_uom){
                var line = this.currentOrder.selected_orderline;
                line.set_unit_price(unit_price);
            }
                
            }
        };

    Registries.Component.extend(ProductScreen, PosResProductScreen);

    class MulitUOMWidget extends AbstractAwaitablePopup {
        multi_uom_button(event){
            // const value = $(event.target).html();
            var uom_id = $(event.target).data('uom_id');
            var price = $(event.target).data('price');
            var line = this.env.pos.get_order().get_selected_orderline();
            if(line){
                line.set_unit_price(price);
                line.set_product_uom(uom_id);
                line.price_manually_set = true;
            }
            this.cancel();
        }
    }
    MulitUOMWidget.template = 'MulitUOMWidget';
    MulitUOMWidget.defaultProps = {
        confirmText: 'Ok',
        cancelText: 'Cancel',
        title: '',
        body: '',
    };

    Registries.Component.add(MulitUOMWidget);

    class ChangeUOMButton extends PosComponent {
        setup() {
            super.setup();
            useListener('click', this.onClick);
        }
        get selectedOrderline() {
            return this.env.pos.get_order().get_selected_orderline();
        }
        async onClick() {
            if (!this.selectedOrderline) return;
            var modifiers_list = [];
            var product = this.selectedOrderline.get_product();
            var em_uom_list = this.env.pos.em_uom_list;
            var multi_uom_ids = product.multi_uom_ids;
            for(var i=0;i<em_uom_list.length;i++){
                if(multi_uom_ids.indexOf(em_uom_list[i].id)>=0){
                    modifiers_list.push(em_uom_list[i]);
                }
            }
            await this.showPopup('MulitUOMWidget', {
                title: this.env._t(' POS Multi UOM '),
                modifiers_list:modifiers_list,
            });
        }
    }
    ChangeUOMButton.template = 'ChangeUOMButton';

    ProductScreen.addControlButton({
        component: ChangeUOMButton,
        condition: function() {
            return this.env.pos.config.allow_multi_uom;
        },
    });

    Registries.Component.add(ChangeUOMButton);


    const PosMultiUomOrderline = (Orderline) => class PosMultiUomOrderline extends Orderline {
        constructor() {
            super(...arguments);
            this.wvproduct_uom = '';
        }

        set_product_uom(uom_id){
            this.wvproduct_uom = this.pos.units_by_id[uom_id];
            // this.trigger('change',this);
        }

        get_unit(){
            var unit_id = this.product.uom_id;
            if(!unit_id){
                return undefined;
            }
            unit_id = unit_id[0];
            if(!this.pos){
                return undefined;
            }
            return this.wvproduct_uom == '' ? this.pos.units_by_id[unit_id] : this.wvproduct_uom;
        }

        export_as_JSON(){
            var unit_id = this.product.uom_id;
            var json = super.export_as_JSON(...arguments);
            json.product_uom = this.wvproduct_uom == '' ? unit_id[0] : this.wvproduct_uom.id;
            return json;
        }
        init_from_JSON(json){
            super.init_from_JSON(...arguments);
            this.wvproduct_uom = json.wvproduct_uom;
        }
        can_be_merged_with(orderline){
            var result = super.can_be_merged_with(...arguments);
            if(result && this.wvproduct_uom.id != orderline.wvproduct_uom.id){
                return false;
            }
            else{
                return result;
            }
        }
    can_be_merged_with(orderline){
        var price = parseFloat(round_di(this.price || 0, this.pos.dp['Product Price']).toFixed(this.pos.dp['Product Price']));
        var order_line_price = orderline.get_product().get_price(orderline.order.pricelist, this.get_quantity());
        order_line_price = round_di(orderline.compute_fixed_price(order_line_price), this.pos.currency.decimal_places);
        if( this.get_product().id !== orderline.get_product().id){    //only orderline of the same product can be merged
            return false;
        }else if(!this.get_unit() || !this.get_unit().is_pos_groupable){
            return false;
        }else if(this.get_discount() > 0){             // we don't merge discounted orderlines
            return false;
        }else if(!utils.float_is_zero(price - order_line_price - orderline.get_price_extra(),this.pos.currency.decimal_places)){
            if(this.wvproduct_uom || orderline.wvproduct_uom){
                if(this.product.tracking == 'lot' && (this.pos.picking_type.use_create_lots || this.pos.picking_type.use_existing_lots)) {
                    return false;
                }else if (this.description !== orderline.description) {
                    return false;
                }else if (orderline.get_customer_note() !== this.get_customer_note()) {
                    return false;
                } else if (this.refunded_orderline_id) {
                    return false;
                }
                else if(this.wvproduct_uom.id != orderline.wvproduct_uom.id){
                    return false;
                }
                else{
                    return true;
                }
            }
            else{
                return false;
            }
        }else if(this.product.tracking == 'lot' && (this.pos.picking_type.use_create_lots || this.pos.picking_type.use_existing_lots)) {
            return false;
        }else if (this.description !== orderline.description) {
            return false;
        }else if (orderline.get_customer_note() !== this.get_customer_note()) {
            return false;
        } else if (this.refunded_orderline_id) {
            return false;
        }
        else if(this.wvproduct_uom.id != orderline.wvproduct_uom.id){
            return false;
        }
        else{
            return true;
        }
    }

    }
    Registries.Model.extend(Orderline, PosMultiUomOrderline);
});

