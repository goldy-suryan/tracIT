const buildingRoute = require('./building.route');
const departmentRoute = require('./department.route');
const custodianRoute = require('./custodian.route');
const manufacturerRoute = require('./manufacturer.route');
const supplierRoute = require('./supplier.route');
const assetTypeRoute = require('./asset.type.route');
const assetsRoute = require('./assets.route');

module.exports = function (app) {
    app.use('/building', buildingRoute);
    app.use('/department', departmentRoute);
    app.use('/custodian', custodianRoute);
    app.use('/manufacturer', manufacturerRoute);
    app.use('/supplier', supplierRoute);
    app.use('/assetType', assetTypeRoute);
    app.use('/assets', assetsRoute);
    return app;
}