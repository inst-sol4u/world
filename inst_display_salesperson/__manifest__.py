# -*- coding: utf-8 -*-
# Part of Instant Solutions 4 You. See LICENSE file for full copyright and licensing details.

{
    "name" : "Display Salesperson",
    "version" : "16.0.1.0",
    "category" : "Sales",
    'summary': "Display Salesperson in Customer Payments",
    "description": """
    The following features are available:

    - Add salesperson to account.payment model to display the salesperson assigned to the
    customer in the payment record
    """,
    "author": "Instant Solutions 4 You",
    "website" : "https://inst-sol4u.com",
    "depends" : [
        'account',
    ],
    "data": [
        'views/account_payment_views.xml'
    ],
    'qweb': [
    ],
    "license":'OPL-1',
    "auto_install": False,
    "installable": True,
}

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
