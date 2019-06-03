const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middlewares/async');

// Getting supplier
router.get('/', asyncMiddleware(async (req, res) => {
    let supplierQuery = new Parse.Query('supplier');
    let suppliers = await supplierQuery.find({ useMasterKey: true });
    if (suppliers && suppliers.length) {
        res.json({ result: suppliers });
    } else {
        res.json({ message: 'No supplier available ' });
    }
}));

// Getting one supplier
router.get('/:id', asyncMiddleware(async (req, res) => {
    let supplierQuery = new Parse.Query('supplier');
    if (req.params.id) {
        let supplier = await supplierQuery.get(req.params.id);
        if (supplier && supplier.id) {
            res.json({ result: supplier });
        } else {
            res.json({ message: 'No supplier available with provided ID' });
        }
    } else {
        res.json({ message: 'Supplier ID is not provided' });
    }
}));

// Creating supplier
router.post('/', asyncMiddleware(async (req, res) => {
    if (!checkingforEmptyValues(req, res)) {
        return;
    }

    let supplierQuery = new Parse.Query('supplier');
    let suppliers = await supplierQuery.find({ useMasterKey: true });
    if (suppliers && suppliers.length) {
        for (let i = 0; i < suppliers.length; i++) {
            if (suppliers[i].get('name') == req.body.name) {
                res.json({ message: 'Supplier name is already exists' });
                return;
            }
        }
    }

    let Supplier = Parse.Object.extend('supplier');
    let supplier = new Supplier();
    settingSupplier(supplier);
    supplier.save();
    res.json({ message: 'Supplier created successfully' });
}));

// Updating custodian
router.put('/:id', asyncMiddleware(async (req, res) => {
    if (!checkingforEmptyValues(req, res)) {
        return;
    }

    let supplierQuery = new Parse.Query('supplier');
    let suppliers = await supplierQuery.find({ useMasterKey: true });
    if (suppliers && suppliers.length) {
        for (let i = 0; i < suppliers.length; i++) {
            if (suppliers[i].id !== req.params.id) {
                if (suppliers[i].get('name') == req.body.name) {
                    res.json({ message: 'Supplier already exists' });
                    return;
                }
            }
        }
    }

    let Supplier = Parse.Object.extend('supplier');
    let newSupplier = new Parse.Query(Supplier);

    if (req.params.id) {
        let supplier = await newSupplier.get(req.params.id);
        settingSupplier(supplier);
        supplier.save();
        res.json({ message: 'Supplier updated successfully' });
    } else {
        res.json({ message: 'Supplier ID not provided' });
    }
}));

// Deleting supplier
router.delete('/:id', asyncMiddleware(async (req, res) => {
    let id = req.params.id;
    let assetsQuery = new Parse.Query('assets');
    assetsQuery.include('supplier');
    let assets = await assetsQuery.find({ useMasterKey: true });

    if (assets && assets.length) {
        for (let i = 0; i < assets.length; i++) {
            if (assets[i] && assets[i].get('supplier') && assets[i].get('supplier').id == id) {
                res.json({ message: 'Cannot delete asset type, as it has associated asset' });
                return;
            }
        }
    }

    if (id) {
        let supplierQuery = new Parse.Query('supplier');
        let supplier = await supplierQuery.get(id);
        if (supplier && supplier.id) {
            supplier.destroy({});
            res.json({ message: 'Supplier deleted successfully' });
        } else {
            res.json({ message: 'Unable to get supplier with provided ID' });
        }
    } else {
        res.json({ message: 'Supplier ID not provided' });
    }
}));


// Helper function
function settingSupplier(supplier) {
    supplier.set('name', (req.body.name) ? req.body.name : null);
    supplier.set('add_1', (req.body.add_1) ? req.body.add_1 : null);
    supplier.set('add_2', (req.body.add_2) ? req.body.add_2 : null);
    supplier.set('city', (req.body.city) ? req.body.city : null);
    supplier.set('state', (req.body.state) ? req.body.state : null);
    supplier.set('phone', (req.body.phone) ? req.body.phone : null);
    supplier.set('email', (req.body.email) ? req.body.email : null);
    supplier.set('reg_no', (req.body.reg_no) ? req.body.reg_no : null);
}

function checkingforEmptyValues(res, res) {
    if (!req.body.name) {
        res.json({ message: 'Name is required' });
        return false;
    }
    if (!req.body.city) {
        res.json({ message: 'City is required' });
        return false;
    }
    if (!req.body.state) {
        res.json({ message: 'State is required' });
        return false;
    }
    if (!req.body.phone) {
        res.json({ message: 'Phone is required' });
        return false;
    }
    return true;
}

module.exports = router;