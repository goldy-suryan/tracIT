const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middlewares/async');

// Getting all buildings
router.get('/', asyncMiddleware(async (req, res) => {
    let buildingQuery = new Parse.Query('building');
    let buildings = await buildingQuery.find({ useMasterKey: true });
    if (buildings && buildings.length) {
        res.json({ result: buildings });
    } else {
        res.json({ message: 'No buildings present' });
    }
}));

// Getting one building
router.get('/:id', asyncMiddleware(async (req, res) => {
    let buildingQuery = new Parse.Query('building');
    let building = await buildingQuery.get(req.params.id);
    if (building && building.id) {
        res.json({ result: building });
    } else {
        res.json({ message: 'No building with provided ID' });
    }
}))

// Creating new building
router.post('/', asyncMiddleware(async (req, res) => {
    if (!req.body.name) {
        res.json({ message: 'Building name is required' });
        return;
    }

    if (req.body.phone.length > 10 || req.body.phone.length < 10) {
        res.json({ message: 'Invalid phone number provided' });
        return;
    }

    let buildingQuery = new Parse.Query('building');
    let buildings = await buildingQuery.find({ useMasterKey: true });

    if (buildings && buildings.length) {
        for (let i = 0; i < buildings.length; i++) {
            if (buildings[i].get('name') == req.body.name) {
                res.json({ message: 'Building name already exists' });
                return;
            } else {
                continue;
            }
        }
    }

    let Building = Parse.Object.extend('building');
    let building = new Building();
    settingBuilding(building);

    building.save();
    res.json({ message: 'Building created successfully' });
}))

// Updating building
router.put('/:id', asyncMiddleware(async (req, res) => {
    if (!req.body.name) {
        res.json({ message: 'Building name is required' });
        return;
    }
    if (req.body.phone.length > 10 || req.body.phone.length < 10) {
        res.json({ message: 'Invalid phone number provided' });
        return;
    }

    let buildingQuery = new Parse.Query('building');
    let buildings = await buildingQuery.find({ useMasterKey: true });
    if (buildings && buildings.length) {
        for (let i = 0; i < buildings.length; i++) {
            if (buildings[i]['id'] != req.params.id) {
                if (buildings[i].get('name') == req.body.name) {
                    res.json({ message: 'Building name already exists' });
                    return;
                }
            }
        }
    }

    let Building = Parse.Object.extend('building')
    let newBuilding = new Parse.Query(Building);
    if (req.params.id) {
        let building = await newBuilding.get(req.params.id);
        settingBuilding(building);
        building.save();
        res.json({ message: 'Building updated successfully' });
    } else {
        res.json({ message: 'Building ID not provided' });
    }

}));

// Deleting building
router.delete('/:id', asyncMiddleware(async (req, res) => {
    let id = req.params.id;

    if (id) {
        let buildingQuery = new Parse.Query('building');
        let building = await buildingQuery.get(id);
        if (building && building.id) {
            building.destroy({});
            res.json({ message: 'Building deleted successfully' });
        } else {
            res.json({ message: 'Unable to get building of provided ID' });
        }
    } else {
        res.json({ message: 'No ID provided' });
    }
}));


// Helper function
function settingBuilding(building) {
    building.set('name', (req.body.name) ? req.body.name : null);
    building.set('add_1', req.body.add_1 ? req.body.add_1 : null);
    building.set('add_2', req.body.add_2 ? req.body.add_2 : null);
    building.set('city', req.body.city ? req.body.city : null);
    building.set('state', req.body.state ? req.body.state : null);
    building.set('phone', req.body.phone ? req.body.phone : null);
}

module.exports = router;