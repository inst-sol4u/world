# -*- coding: utf-8 -*-
# Part of Instant Solutions 4 You. See LICENSE file for full copyright and licensing details.
from odoo import models, fields, api, _


class AccountPayment(models.Model):
    _inherit = "account.payment"

    @api.depends("partner_id")
    def _compute_salesperson_id(self):
        for rec in self:
            rec.salesperson_id = rec.partner_id.user_id.id if rec.partner_id else False

    salesperson_id = fields.Many2one("res.users", string=_("Salesperson"),
        compute="_compute_salesperson_id", store=True)
