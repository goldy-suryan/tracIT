const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middlewares/async');

// Getting assetType
router.get('/', asyncMiddleware(async (req, res) => {
    let assetTypeQuery = new Parse.Query('assetType');
    let assetTypes = await assetTypeQuery.find({ useMasterKey: true });
    if (assetTypes && assetTypes.length) {
        res.json({ result: assetTypes });
    } else {
        res.json({ message: 'No assetType available ' });
    }
}));

// Getting one assetType
router.get('/:id', asyncMiddleware(async (req, res) => {
    let assetTypeQuery = new Parse.Query('assetType');
    if (req.params.id) {
        let assetType = await assetTypeQuery.get(req.params.id);
        if (assetType && assetType.id) {
            res.json({ result: assetType });
        } else {
            res.json({ message: 'No assetType available with provided ID' });
        }
    } else {
        res.json({ message: 'AssetType ID is not provided' });
    }
}));

// Creating assetType
router.post('/', asyncMiddleware(async (req, res) => {
    if (!req.body.typeName) {
        res.json({ message: 'Asset type is required' });
        return;
    }
    if (!req.body.groupName) {
        res.json({ message: 'Asset group name is required' });
        return;
    }

    let assetTypeQuery = new Parse.Query('assetType');
    let assetTypes = await assetTypeQuery.find({ useMasterKey: true });

    if (assetTypes && assetTypes.length) {
        for (let i = 0; i < assetTypes.length; i++) {
            if (assetTypes[i].get('typeName') == req.body.typeName) {
                res.json({ message: 'Asset Type name already exists' });
                return;
            }
        }
    }

    let AssetType = Parse.Object.extend('assetType');
    let assetType = new AssetType();
    settingAssetType(assetType, req);
    assetType.save().then(type => {
        if (type) res.json({ message: 'Asset type created successfully' });
        else res.json({ message: 'Unable to create Asset type' });
    })
}));


// Updating asset type
router.put('/:id', asyncMiddleware(async (req, res) => {
    if (!req.body.typeName) {
        res.json({ message: 'Asset type is required' });
        return;
    }
    if (!req.body.groupName) {
        res.json({ message: 'Asset group name is required' });
        return;
    }

    let assetTypeQuery = new Parse.Query('assetType');
    let assetTypes = await assetTypeQuery.find({ useMasterKey: true });
    if (assetTypes && assetTypes.length) {
        for (let i = 0; i < assetTypes.length; i++) {
            if (assetTypes[i].id != req.params.id) {
                if (assetTypes[i].get('typeName') == req.body.typeName) {
                    res.json({ message: 'Asset type already exists' });
                    return;
                }
            }
        }
    }

    let AssetType = Parse.Object.extend('assetType');
    let newAssetType = new Parse.Query(AssetType);

    if (req.params.id) {
        let assetType = await newAssetType.get(req.params.id);
        settingAssetType(assetType, req);
        assetType.save();
        res.json({ message: 'Asset type created successfully' });
    } else {
        res.json({ message: 'Asset type ID not provided' });
    }
}));


// Delete asset type
router.delete('/:id', asyncMiddleware(async (req, res) => {
    let id = req.params.id;
    let assetsQuery = new Parse.Query('assets');
    assetsQuery.include('asset_type');
    let assets = await assetsQuery.find({ useMasterKey: true });

    if (assets && assets.length) {
        for (let i = 0; i < assets.length; i++) {
            if (assets[i] && assets[i].get('asset_type') && assets[i].get('asset_type').id == id) {
                res.json({ message: 'Cannot delete asset type, as it has associated asset' });
                return;
            }
        }
    }

    if (id) {
        let assetTypeQuery = new Parse.Query('assetType');
        let assetType = await assetTypeQuery.get(id);
        if (assetType && assetType.id) {
            assetType.destroy({});
            res.json({ result: 'Asset type deleted successfully' });
        } else {
            res.json({ message: 'Unable to find Asset type with provided ID' });
        }
    } else {
        res.json({ message: 'Asset type ID not provided' });
    }
}));


// Helper function
function settingAssetType(assetType, req) {
    assetType.set('typeName', req.body.typeName);
    assetType.set('groupName', { '__type': 'Pointer', 'className': 'assetGroup', 'objectId': req.body.groupName })
    assetType.set('name_1', (req.body.name_1) ? req.body.name_1 : null);
    assetType.set('name_2', (req.body.name_2) ? req.body.name_2 : null);
    assetType.set('name_3', (req.body.name_3) ? req.body.name_3 : null);
    assetType.set('name_4', (req.body.name_4) ? req.body.name_4 : null);
    assetType.set('name_5', (req.body.name_5) ? req.body.name_5 : null);
    assetType.set('name_6', (req.body.name_6) ? req.body.name_6 : null);
    assetType.set('name_7', (req.body.name_7) ? req.body.name_7 : null);
    assetType.set('name_8', (req.body.name_8) ? req.body.name_8 : null);
    assetType.set('serial_no', req.body.serial_no);
    assetType.set('dep_rate', (req.body.dep_rate) ? req.body.dep_rate : null);
}

module.exports = router;