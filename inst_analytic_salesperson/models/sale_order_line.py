# -*- coding: utf-8 -*-
# Part of Instant Solutions 4 You. See LICENSE file for full copyright and licensing details.
from odoo import models, fields, api, _


class SaleOrderLine(models.Model):
    _inherit = "sale.order.line"

    @api.depends('order_id.partner_id', 'product_id', 'order_id.user_id')
    def _compute_analytic_distribution(self):
        for line in self:
            if not line.display_type and line.state == 'draft':
                distribution = line.env['account.analytic.distribution.model']._get_distribution({
                    "product_id": line.product_id.id,
                    "product_categ_id": line.product_id.categ_id.id,
                    "partner_id": line.order_id.partner_id.id,
                    "partner_category_id": line.order_id.partner_id.category_id.ids,
                    "salesperson_id": line.order_id.user_id.id,
                    "company_id": line.company_id.id,
                })
                line.analytic_distribution = distribution or line.analytic_distribution
