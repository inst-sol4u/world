# -*- coding: utf-8 -*-
# Part of Instant Solutions 4 You. See LICENSE file for full copyright and licensing details.
from odoo import models, fields, api, _


class AccountAnalyticDistributionModel(models.Model):
    _inherit = "account.analytic.distribution.model"

    salesperson_id = fields.Many2one("res.users", string=_("Salesperson"))
