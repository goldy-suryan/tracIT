const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middlewares/async');

// Getting custodian
router.get('/', asyncMiddleware(async (req, res) => {
    let custodianQuery = new Parse.Query('custodian');
    let custodians = await custodianQuery.find({ useMasterKey: true });
    if (custodians && custodians.length) {
        res.json({ result: custodians });
    } else {
        res.json({ message: 'No custodian available ' });
    }
}));

// Getting one custodian
router.get('/:id', asyncMiddleware(async (req, res) => {
    let custodianQuery = new Parse.Query('custodian');
    if (req.params.id) {
        let custodian = await custodianQuery.get(req.params.id);
        if (custodian && custodian.id) {
            res.json({ result: custodian });
        } else {
            res.json({ message: 'No custodian available with provided ID' });
        }
    } else {
        res.json({ message: 'custodian ID is not provided' });
    }
}));

// creating custodian
router.post('/', asyncMiddleware(async (req, res) => {
    if (!checkingForEmptyValues(req, res)) {
        return;
    }

    let Custodian = Parse.Object.extend('custodian');
    let custodian = new Custodian();
    settingCustodian(custodian);
    custodian.save();
    res.json({ message: 'custodian created successfully' });
}));

// Updating custodian
router.put('/:id', asyncMiddleware(async (req, res) => {
    if (!checkingForEmptyValues(req, res)) {
        return;
    }

    let Custodian = Parse.Object.extend('custodian');
    let newCustodian = new Parse.Query(Custodian);

    if (req.params.id) {
        let custodian = await newCustodian.get(req.params.id);
        settingCustodian(custodian);
        custodian.save();
        res.json({ message: 'custodian updated successfully' });
    } else {
        res.json({ message: 'custodian ID not provided' });
    }
}));

// Deleting custodian
router.delete('/:id', asyncMiddleware(async (req, res) => {
    let id = req.params.id;
    let assetsQuery = new Parse.Query('assets');
    assetsQuery.include('current_custodian');
    let assets = await assetsQuery.find({ useMasterKey: true });

    if (assets && assets.length) {
        for (let i = 0; i < assets.length; i++) {
            if (assets[i] && assets[i].get('current_custodian') && assets[i].get('current_custodian').id == id) {
                res.json({ message: 'Cannot delete custodian, as he/she has associated asset' });
                return;
            }
        }
    }

    if (id) {
        let custodianQuery = new Parse.Query('custodian');
        let custodian = custodianQuery.get(id);
        if (custodian && custodian.id) {
            custodian.destroy({});
            res.json({ message: 'Building deleted successfully' });
        } else {
            res.json({ message: 'Unable to get custodian with provided ID' });
        }
    } else {
        res.json({ message: 'custodian ID not provided' });
    }
}));


// Helper function
function settingCustodian(custodian) {
    custodian.set('f_name', req.body.f_name);
    custodian.set('l_name', req.body.l_name);
    custodian.set('email', req.body.email);
    custodian.set('phone', req.body.phone);
}

function checkingForEmptyValues(req, res) {
    if (!req.body.f_name) {
        res.json({ message: 'First name is required' });
        return false;
    }
    if (!req.body.email) {
        res.json({ message: 'Email is required' });
        return false;
    }
    if (!req.body.phone) {
        res.json({ message: 'Phone is required' });
        return false;
    }
    if (req.body.phone.length > 10 || req.body.phone.length < 10) {
        res.json({ message: 'Invalid phone number provided' });
        return false;
    }
    return true;
}

module.exports = router;