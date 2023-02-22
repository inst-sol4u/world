# -*- coding: utf-8 -*-
# Part of Instant Solutions 4 You. See LICENSE file for full copyright and licensing details.
from odoo import models, fields, api, _


class SaleOrder(models.Model):
    _inherit = "sale.order"

    @api.onchange('partner_id')
    def _onchange_partner_id_warning(self):
        super()._onchange_partner_id_warning()
        
        value = {}
        if self.user_id:
            salesperson_analytic_account = self.env['account.analytic.account'].search([
                ('name', 'ilike', self.user_id.name)])
            value['analytic_account_id'] = salesperson_analytic_account.id \
                if salesperson_analytic_account \
                else False

        return {
            'value': value
        }
