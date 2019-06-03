const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middlewares/async');
const multer = require('multer');
const upload = multer();
const request = require('request');

// Getting assets
router.get('/', asyncMiddleware(async (req, res) => {
    let assetsQuery = new Parse.Query('assets');
    includePointers(assetsQuery);
    let assets = await assetsQuery.find({ useMasterKey: true });
    if (assets && assets.length) {
        res.json({ result: assets });
    } else {
        res.json({ message: 'No assets present' });
    }
}));

// Getting one asset
router.get('/:id', asyncMiddleware(async (req, res) => {
    let assetsQuery = new Parse.Query('assets');
    includePointers(assetsQuery);
    let asset = await assetsQuery.get(req.params.id);
    if (asset && asset.id) {
        res.json({ result: asset });
    } else {
        res.json({ message: 'No asset with provided ID' });
    }
}));

// Creating asset
router.post('/', upload.array('photos'), asyncMiddleware(async (req, res) => {
    if (!checkingEmptyValues(req, res)) {
        return;
    }

    let assetsQuery = new Parse.Query('assets');
    let assets = await assetsQuery.find({ useMasterKey: true });

    if (assets && assets.length) {
        for (let i = 0; i < assets.length; i++) {
            if (assets[i].get('qrcode') == req.body.qrcode) {
                res.json({ message: 'Tag Id already exists' });
                return;
            }
        }
    }

    let fileArr = [];
    if (req.files && req.files.length) {
        for (let i = 0; i < req.files.length; i++) {
            let data = { base64: req.files[i].buffer.toString('base64') }
            var file = new Parse.File(req.files[i].fieldname, data);
            fileArr.push(file.save());
        }
    }

    let Asset = Parse.Object.extend('assets');
    let asset = new Asset();
    createAsset(asset, req);

    Promise.all(fileArr).then(data => {
        if (data && data.length) {
            for (let i = 0; i < data.length; i++) {
                asset.set(`image_${i + 1}`, (`image_${i + 1}`) ? { '__type': 'File', 'name': data[i].name(), 'url': data[i].url() } : null);
                asset.save();
            }
        }
    });
    asset.save().then(async (as) => {
        let AssetType = Parse.Object.extend('assetType')
        let assetTypeQuery = new Parse.Query(AssetType);
        let assetType = await assetTypeQuery.get(req.body.asset_type);
        assetType.increment('assets', 1);
        assetType.save().then(_ => {
            res.json({ message: 'Asset created successfully' });
        })
    });
}));


// Updating asset
router.put('/:id', upload.array('photos'), asyncMiddleware(async (req, res) => {
    if (!checkingEmptyValues(req, res)) {
        return;
    }

    let assetsQuery = new Parse.Query('assets');
    let assets = await assetsQuery.find({ useMasterKey: true });

    if (assets && assets.length) {
        for (let i = 0; i < assets.length; i++) {
            if (assets[i].id != req.params.id) {
                if (assets[i].get('qrcode') == req.body.qrcode) {
                    res.json({ message: 'Asset with provided Tag ID already exists' });
                    return;
                }
            }
        }
    }

    let fileArr = [];
    if (req.files && req.files.length) {
        for (let i = 0; i < req.files.length; i++) {
            let data = { base64: req.files[i].buffer.toString('base64') }
            var file = new Parse.File(req.files[i].fieldname, data);
            fileArr.push(file.save());
        }
    }

    let Asset = Parse.Object.extend('assets');
    let assetQuery = new Parse.Query(Asset);
    let asset = await assetQuery.get(req.params.id);
    createAsset(asset, req);

    Promise.all(fileArr).then(data => {
        if (data && data.length) {
            loop1: for (let i = 0; i < data.length; i++) {
                loop2: for (let j = 0; j < 4; j++) {
                    if (!asset.get(`image_${j + 1}`)) {
                        asset.set(`image_${j + 1}`, (`image_${j + 1}`) ? { '__type': 'File', 'name': data[i].name(), 'url': data[i].url() } : null);
                        asset.save();
                        break loop2;
                    }
                }
            }
        }
    });

    asset.save().then((as) => {
        res.json({ message: 'Asset updated successfully' });
    });
}));


// Delete asset
router.delete('/:id', asyncMiddleware(async (req, res) => {
    let id = req.params.id;
    let assetsQuery = new Parse.Query('assets');
    assetsQuery.include('asset_type');
    let assets = await assetsQuery.get(id);
    // res.send(assets);
    for (let i = 0; i < 4; i++) {
        if (assets && assets.get(`image_${i + 1}`)) {
            let fileName = encodeURI(assets.get(`image_${i + 1}`).name());
            const options = {
                url: `http://localhost:1337/parse/files/${fileName}`,
                headers: {
                    'X-Parse-Application-Id': 'myAppId',
                    'X-Parse-REST-API-Key': 'restkey',
                    'X-Parse-Master-Key': 'myMasterKey'
                }
            };
            request.delete(options, (err, res, body) => {
                if (err) {
                    res.json({ message: 'Unable to delete file' });
                    return;
                }
            })
        }
    }

    if (id) {
        if (assets && assets.id) {
            let AssetType = Parse.Object.extend('assetType')
            let assetTypeQuery = new Parse.Query(AssetType);
            let assetType = await assetTypeQuery.get(assets.get('asset_type').id);
            assetType.increment('assets', -1);
            assetType.save().then(_ => {
                assets.destroy({});
                res.json({ result: 'Assets deleted successfully' });
            })
        } else {
            res.json({ result: 'Unable to find Assets with given ID' });
        }
    } else {
        res.json({ result: 'Asset ID not provided' });
    }
}));


// Helper functions
function createAsset(asset, req) {
    asset.set('qrcode', req.body.qrcode);
    asset.set('asset_type', { '__type': 'Pointer', 'className': 'assetType', 'objectId': req.body.asset_type });
    asset.set('desc', (req.body.desc) ? req.body.desc : null);
    asset.set('external_id', (req.body.external_id) ? req.body.external_id : null);
    asset.set('enabled', (req.body.enabled) ? req.body.enabled : null);
    asset.set('current_room', { '__type': 'Pointer', 'className': 'room', 'objectId': req.body.current_room });
    asset.set('current_department', (req.body.current_department) ? { '__type': 'Pointer', 'className': 'department', 'objectId': req.body.current_department } : null);
    asset.set('current_custodian', (req.body.current_custodian) ? { '__type': 'Pointer', 'className': 'custodian', 'objectId': req.body.current_custodian } : null);
    asset.set('latest_attendance_time', new Date().valueOf());
    asset.set('current_status', (req.body.current_status) ? req.body.current_status : null);
    asset.set('manufacturer', (req.body.manufacturer) ? { '__type': 'Pointer', 'className': 'manufacturer', 'objectId': req.body.manufacturer } : null);
    asset.set('model', req.body.model);
    asset.set('serial_no', (req.body.serial_no) ? req.body.serial_no : null);
    asset.set('is_outside', (req.body.is_outside) ? req.body.is_outside : false);
    asset.set('outside_description', (req.body.outside_description) ? req.body.outside_description : null);
    asset.set('invoice_id', (req.body.invoice_id) ? req.body.invoice_id : null);
    asset.set('invoice_date', (req.body.invoice_date) ? req.body.invoice_date : null);
    asset.set('purchase_price', (req.body.purchase_price) ? req.body.purchase_price : null);
    asset.set('supplier', (req.body.supplier) ? { '__type': 'Pointer', 'className': 'supplier', 'objectId': req.body.supplier } : null);
    asset.set('amc_upto', (req.body.amc_upto) ? req.body.amc_upto : null);
    asset.set('service_contact', (req.body.service_contact) ? req.body.service_contact : null);
}

function checkingEmptyValues(req, res) {
    if (!req.body.qrcode) {
        res.json({ message: 'Tag ID is required' });
        return false;
    }
    if (!req.body.asset_type) {
        res.json({ message: 'Asset type is required' });
        return false;
    }
    if (!req.body.current_room) {
        res.json({ message: 'Room is required' });
        return false;
    }
    if (!req.body.model) {
        res.json({ message: 'Model is required' });
        return false;
    }
    return true;
}

function includePointers(assetsQuery) {
    assetsQuery.include('asset_type');
    assetsQuery.include('current_room');
    assetsQuery.include('current_room.building');
    assetsQuery.include('current_custodian');
    assetsQuery.include('department');
    assetsQuery.include('manufacturer');
    assetsQuery.include('supplier');
}

module.exports = router;