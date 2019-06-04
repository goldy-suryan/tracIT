Parse.Cloud.beforeSave('assets', async (req, res) => {
    let assetObj = req.object;
    let qrcode = assetObj.get('qrcode');
    let subQrcode = qrcode.substr(6);

    if (!qrcode.startsWith('UQA')) {
        res.error('Tag Id invalid');
        return;
    }

    let totalAscii = 0;
    for (let i = 0; i < subQrcode.length; i++) {
        totalAscii += subQrcode[i].charCodeAt(i);
    }

    if (totalAscii % 2 == 0) {
        res.error('Tag Id invalid');
        return;
    }

    let Asset = Parse.Object.extend('assets')
    let assetQuery = new Parse.Query(Asset);
    let assets = await assetQuery.find({ useMasterKey: true });

    if (assets && assets.length) { // have to look for on edit
        for (let i = 0; i < assets.length; i++) {
            if (assets[i].get('qrcode') == qrcode) {
                res.error('Tag Id already exists');
                return;
            }
        }
    }

    let asset = new Asset();
    createAsset(asset, assetObj);
    asset.save().then(newAsset => {
        res.success(newAsset);
    })
});


Parse.Cloud.afterSave('assets', (req, res) => {
    console.log(req);
    // create Log if get the object id on req of new asset
})

Parse.Cloud.beforeSave('example', async (req, res) => {
    console.log(req.object.get('typeName'));
    console.log(res)
});

function createAsset(asset, obj) {
    asset.set('qrcode', obj.get('qrcode') ? obj.get('qrcode').substr(6) : null);
    asset.set('assets_type', obj.get('assets_type') ? { '__type': 'Pointer', 'className': 'assets_type', 'objectId': obj.get('assets_type') } : null);
    asset.set('desc', obj.get('desc') ? obj.get('desc') : null);
    asset.set('external_id', obj.get('external_id') ? obj.get('external_id') : null);
    asset.set('enabled', obj.get('enabled') ? obj.get('enabled') : null);
    asset.set('current_room', obj.get('current_room') ? { '__type': 'Pointer', 'className': 'room', 'objectId': obj.get('current_room') } : null);
    asset.set('current_department', obj.get('current_department') ? { '__type': 'Pointer', 'className': 'department', 'objectId': obj.get('current_department') } : null);
    asset.set('current_custodian', obj.get('current_custodian') ? { '__type': 'Pointer', 'className': 'custodian', 'objectId': obj.get('current_custodian') } : null);
    asset.set('latest_attendance_time', obj.get('latest_attendance_time') ? obj.get('lastest_attendance_time') : new Date().valueOf());
    asset.set('current_status', obj.get('current_status') ? obj.get('current_status') : null);
    asset.set('manufacturer', obj.get('manufacturer') ? { '__type': 'Pointer', 'className': 'manufacturer', 'objectId': obj.get('manufacturer') } : null);
    asset.set('model', obj.get('model') ? obj.get('model') : null);
    asset.set('serial_no', obj.get('serial_no') ? obj.get('serial_no') : null);
    asset.set('invoice_id', obj.get('invoice_id') ? obj.get('invoice_id') : null);
    asset.set('invoice_date', obj.get('invoice_date') ? obj.get('invoice_date') : null);
    asset.set('purchase_price', obj.get('purchase_price') ? obj.get('purchase_price') : null);
    asset.set('supplier_name', obj.get('supplier_name') ? { '__type': 'Pointer', 'supplier': 'assets_type', 'objectId': obj.get('supplier_name') } : null);
    asset.set('amc_upto', obj.get('amc_upto') ? obj.get('amc_upto') : null);
    asset.set('service_contact', obj.get('service_contact') ? obj.get('service_contact') : null);
    asset.set('user_field_1', obj.get('user_field_1') ? obj.get('user_field_1') : null);
    asset.set('user_field_2', obj.get('user_field_2') ? obj.get('user_field_2') : null);
    asset.set('user_field_3', obj.get('user_field_3') ? obj.get('user_field_3') : null);
    asset.set('user_field_4', obj.get('user_field_4') ? obj.get('user_field_4') : null);
    asset.set('user_field_5', obj.get('user_field_5') ? obj.get('user_field_5') : null);
    asset.set('user_field_6', obj.get('user_field_6') ? obj.get('user_field_6') : null);
    asset.set('user_field_7', obj.get('user_field_7') ? obj.get('user_field_7') : null);
    asset.set('user_field_8', obj.get('user_field_8') ? obj.get('user_field_8') : null);
}