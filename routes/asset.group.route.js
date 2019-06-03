const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middlewares/async');

// Getting asset group
router.get('/', asyncMiddleware(async (req, res) => {
    let assetGroupQuery = new Parse.Query('assetGroup');
    let assetGroup = await assetGroupQuery.find({ useMasterKey: true });
    if (assetGroup && assetGroup.length) {
        res.json({ result: assetGroup });
    } else {
        res.json({ message: 'No asset group present' });
    }
}));

// Getting one asset group
router.get('/:id', asyncMiddleware(async (req, res) => {
    let assetGroupQuery = new Parse.Query('assetGroup');
    let assetGroup = await assetGroupQuery.get(req.params.id);
    if (assetGroup && assetGroup.id) {
        res.json({ result: assetGroup });
    } else {
        res.json({ message: 'No asset group exists with provided ID' });
    }
}));

// Create asset Group
router.post('/', asyncMiddleware(async (req, res) => {
    if (!req.body.name) {
        res.json({ message: 'Group name is required' });
        return;
    }

    let AssetGroup = Parse.Object.extend('assetGroup');
    let assetGroup = new AssetGroup();
    createGroup(assetGroup);
    assetGroup.save().then(group => {
        if (group) res.json({ message: 'Asset group saved successfully' });
        else res.json({ message: 'Unable to create group' });
    });
}));


// Updating asset group
router.put('/:id', asyncMiddleware(async (req, res) => {
    let id = req.params.id;
    let AssetGroup = Parse.Object.extend('assetGroup');
    let assetGroupQuery = new Parse.Query(AssetGroup);
    let assetGroups = await assetGroupQuery.find({ useMasterKey: true });

    if (assetGroups && assetGroups.length) {
        for (let i = 0; i < assetGroups.length; i++) {
            if (assetGroups[i].id != id) {
                if (assetGroups[i].get('name') == req.body.name) {
                    res.json({ message: 'Group with the provided name already exists' });
                    return;
                }
            }
        }
    }

    let assetGroup = new AssetGroup();
    let group = await assetGroupQuery.get(id);
    if (group && group.id) {
        assetGroup.set('name', req.body.name);
        assetGroup.save().then(group => {
            group ? res.json({ message: 'Asset group updated successfully' }) : res.json({ message: 'Unable to update group' });
        });
    }
}));


// Deleting asset group
router.delete('/:id', asyncMiddleware(async (req, res) => {
    let id = req.params.id;
    let assetTypeQuery = new Parse.Query('assetType');
    let assetTypes = await assetTypeQuery.find({ useMasterKey: true });

    if (assetTypes && assetTypes.length) {
        for (let i = 0; i < assetTypes.length; i++) {
            if (assetTypes[i].get('group').id == id) {
                res.json({ message: 'Unable to delete asset group as it has associated asset type' });
                return;
            }
        }
    }

    if (id) {
        let assetGroupQuery = new Parse.Query('assetGroup');
        let assetGroup = await assetGroupQuery.get(id);
        if (assetGroup && assetGroup.id) {
            let group = await assetGroup.destroy({});
            group ? res.json({ message: 'Asset group deleted successfully' }) : res.json({ message: 'Unable to delete asset group' });
        } else {
            res.json({ message: 'Unable to find Asset group with provided ID' });
        }
    } else {
        res.json({ message: 'Asset group ID not provided' });
    }
}));


// Helper functions
function createGroup(group) {
    group.set('name', req.body.name);
}

module.exports = router;