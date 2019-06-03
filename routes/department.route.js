const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middlewares/async');

// Getting all departments
router.get('/', asyncMiddleware(async (req, res) => {
    let departmentQuery = new Parse.Query('department');
    let departments = await departmentQuery.find({ useMasterKey: true });
    if (departments && departments.length) {
        res.json({ result: departments });
    } else {
        res.json({ message: 'No department available ' });
    }
}));

// Getting one department
router.get('/:id', asyncMiddleware(async (req, res) => {
    let departmentQuery = new Parse.Query('department');
    if (req.params.id) {
        let department = await departmentQuery.get(req.params.id);
        if (department && department.id) {
            res.json({ result: department });
        } else {
            res.json({ message: 'No department available with provided ID' });
        }
    } else {
        res.json({ message: 'Department ID is not provided' });
    }
}));

// Creating department
router.post('/', asyncMiddleware(async (req, res) => {
    if (!checkingForEmptyValues(req, res)) {
        return;
    }

    let departmentQuery = new Parse.Query('department');
    let departments = await departmentQuery.find({ useMasterKey: true });
    if (departments && departments.length) {
        for (let i = 0; i < departments.length; i++) {
            if (departments[i].get('name') == req.body.name) {
                res.json({ message: 'Department name already exists' });
                return;
            }
        }
    }

    let Department = Parse.Object.extend('department');
    let department = new Department();
    settingDepartment(department);
    department.save();
    res.json({ message: 'Department created successfully' });
}));

// Updating department
router.put('/:id', asyncMiddleware(async (req, res) => {
    if (!checkingForEmptyValues(req, res)) {
        return;
    }

    let departmentQuery = new Parse.Query('department');
    let departments = await departmentQuery.find({ useMasterKey: true });
    if (departments && departments.length) {
        for (let i = 0; i < departments.length; i++) {
            if (departments[i].id !== req.params.id) {
                if (departments[i].get('name') == req.body.name) {
                    res.json({ message: 'Department name already exists' });
                    return;
                }
            }
        }
    }

    let Department = Parse.Object.extend('department');
    let newDepartment = new Parse.Query(Department);

    if (req.params.id) {
        let department = await newDepartment.get(req.params.id);
        settingDepartment(department);
        department.save();
        res.json({ message: 'Department updated successfully' });
    } else {
        res.json({ message: 'Department ID not provided' });
    }
}));

// Deleting department
router.delete('/:id', asyncMiddleware(async (req, res) => {
    let id = req.params.id;

    let assetsQuery = new Parse.Query('assets');
    assetsQuery.include('current_department');
    let assets = await assetsQuery.find({ useMasterKey: true });

    if (assets && assets.length) {
        for (let i = 0; i < assets.length; i++) {
            if (assets[i] && assets[i].get('current_department') && assets[i].get('current_department').id == id) {
                res.json({ message: 'Cannot delete department, as it has associated asset' });
                return;
            }
        }
    }

    if (id) {
        let departmentQuery = new Parse.Query('department');
        let department = departmentQuery.get(id);
        if (department && department.id) {
            department.destroy({});
            res.json({ message: 'Building deleted successfully' });
        } else {
            res.json({ message: 'Unable to get building of provided ID' });
        }
    } else {
        res.json({ message: 'Department ID not provided' });
    }
}));


// Helper function
function settingDepartment(department) {
    department.set('name', req.body.name);
    department.set('add_1', req.body.add_1);
    department.set('add_2', req.body.add_2);
    department.set('city', req.body.city);
    department.set('state', req.body.state);
    department.set('phone', req.body.phone);
}

function checkingForEmptyValues(req, res) {
    if (!req.body.name) {
        res.json({ message: 'Building name is required' });
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
    if (req.body.phone.length > 10 || req.body.phone.length < 10) {
        res.json({ message: 'Invalid phone number provided' });
        return false;
    }
    return true;
}

module.exports = router;