const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middlewares/async');

// Getting manufacturer
router.get('/', asyncMiddleware(async (req, res) => {
    let manufacturerQuery = new Parse.Query('manufacturer');
    let manufacturers = await manufacturerQuery.find({ useMasterKey: true });
    if (manufacturers && manufacturers.length) {
        res.json({ result: manufacturers });
    } else {
        res.json({ message: 'No manufacturer available ' });
    }
}));

// Getting one manufacturer
router.get('/:id', asyncMiddleware(async (req, res) => {
    let manufacturerQuery = new Parse.Query('manufacturer');
    if (req.params.id) {
        let manufacturer = await manufacturerQuery.get(req.params.id);
        if (manufacturer && manufacturer.id) {
            res.json({ result: manufacturer });
        } else {
            res.json({ message: 'No manufacturer available with provided ID' });
        }
    } else {
        res.json({ message: 'manufacturer ID is not provided' });
    }
}));

// Creating manufacturer
router.post('/', asyncMiddleware(async (req, res) => {
    if (!req.body.name) {
        res.json({ message: 'Name is required' });
        return;
    }

    let manufacturerQuery = new Parse.Query('manufacturer');
    let manufacturers = await manufacturerQuery.find({ useMasterKey: true });
    if (manufacturers && manufacturers.length) {
        for (let i = 0; i < manufacturers.length; i++) {
            if (manufacturers[i].get('name') == req.body.name) {
                res.json({ message: 'Manufacturer name is already exists' });
                return;
            }
        }
    }

    let Manufacturer = Parse.Object.extend('manufacturer');
    let manufacturer = new Manufacturer();
    settingManufacturer(manufacturer);
    manufacturer.save();
    res.json({ message: 'Manufacturer created successfully' });
}));

// Updating custodian
router.put('/:id', asyncMiddleware(async (req, res) => {
    if (!req.body.name) {
        res.json({ message: 'Name is required' });
        return;
    }

    let manufacturerQuery = new Parse.Query('manufacturer');
    let manufacturers = await manufacturerQuery.find({ useMasterKey: true });
    if (manufacturers && manufacturers.length) {
        for (let i = 0; i < manufacturers.length; i++) {
            if (manufacturers[i].id !== req.params.id) {
                if (manufacturers[i].get('name') == req.body.name) {
                    res.json({ message: 'Manufacturer already exists' });
                    return;
                }
            }
        }
    }

    let Manufacturer = Parse.Object.extend('manufacturer');
    let newManufacturer = new Parse.Query(Manufacturer);

    if (req.params.id) {
        let manufacturer = await newManufacturer.get(req.params.id);
        settingManufacturer(manufacturer);
        manufacturer.save();
        res.json({ message: 'Manufacturer updated successfully' });
    } else {
        res.json({ message: 'Manufacturer ID not provided' });
    }
}));

// Deleting manufacturer
router.delete('/:id', asyncMiddleware(async (req, res) => {
    let id = req.params.id;

    let assetsQuery = new Parse.Query('assets');
    assetsQuery.include('manufacturer');
    let assets = await assetsQuery.find({ useMasterKey: true });

    if (assets && assets.length) {
        for (let i = 0; i < assets.length; i++) {
            if (assets[i] && assets[i].get('manufacturer') && assets[i].get('manufacturer').id == id) {
                res.json({ message: 'Cannot delete manufacturer, as it has associated asset' });
                return;
            }
        }
    }

    if (id) {
        let manufacturerQuery = new Parse.Query('manufacturer');
        let manufacturer = await manufacturerQuery.get(id);
        if (manufacturer && manufacturer.id) {
            manufacturer.destroy({});
            res.json({ message: 'Manufacturer deleted successfully' });
        } else {
            res.json({ message: 'Unable to get manufacturer with provided ID' });
        }
    } else {
        res.json({ message: 'Manufacturer ID not provided' });
    }
}));


// Helper function
function settingManufacturer(manufacturer) {
    manufacturer.set('name', (req.body.name) ? req.body.name : null);
    manufacturer.set('add_1', (req.body.add_1) ? req.body.add_1 : null);
    manufacturer.set('add_2', (req.body.add_2) ? req.body.add_2 : null);
    manufacturer.set('city', (req.body.city) ? req.body.city : null);
    manufacturer.set('state', (req.body.state) ? req.body.state : null);
    manufacturer.set('phone', (req.body.phone) ? req.body.phone : null);
    manufacturer.set('email', (req.body.email) ? req.body.email : null);
}
module.exports = router;