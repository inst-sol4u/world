# -*- coding: utf-8 -*-
# Part of Instant Solutions 4 You. See LICENSE file for full copyright and licensing details.

{
    "name" : "Analytic Salesperson",
    "version" : "16.0.1.0",
    "category" : "Sales",
    'summary': "Add Salesperson to Analytic Distribution Model",
    "description": """
    The following features are available:

    - Add salesperson to account.analytic.distribution.model model to apply analytic on sale order's lines
    """,
    "author": "Instant Solutions 4 You",
    "website" : "https://inst-sol4u.com",
    "depends" : [
        'analytic',
        'sale',
    ],
    "data": [
        'views/account_analytic_distribution_model_views.xml'
    ],
    'qweb': [
    ],
    "license":'OPL-1',
    "auto_install": False,
    "installable": True,
}

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
