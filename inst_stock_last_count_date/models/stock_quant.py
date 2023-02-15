# -*- coding: utf-8 -*-
# Part of Instant Solutions 4 You. See LICENSE file for full copyright and licensing details.
from odoo import models, fields, api, _


class StockQuant(models.Model):
    _inherit = "stock.quant"

    last_count_date = fields.Date(compute='_compute_last_count_date',
        store=True,
        help='Last time the Quantity was Updated')
