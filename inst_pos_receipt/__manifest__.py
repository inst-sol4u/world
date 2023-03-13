# -*- coding: utf-8 -*-
# Part of Instant Solutions 4 You. See LICENSE file for full copyright and licensing details.

{
    "name" : "Change POS Receipt",
    "version" : "16.0.1.0",
    "category" : "Sales/Point of Sale",
    'summary': "Change POS Receipt layout",
    "description": """
    The following features are available:

    - Change POS Receipt layout
    """,
    "author": "Instant Solutions 4 You",
    "website" : "https://inst-sol4u.com",
    "depends" : [
        'l10n_sa_pos',
    ],
    'assets': {
        'point_of_sale.assets': [
            'inst_pos_receipt/static/src/css/pos_receipts.css',
            'inst_pos_receipt/static/src/js/models.js',
            'inst_pos_receipt/static/src/xml/OrderReceipt.xml',
        ]
    },
    "license":'OPL-1',
    "auto_install": False,
    "installable": True,
}

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
