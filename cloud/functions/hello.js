// getting all the data of the classes
Parse.Cloud.define('assetsPointers', async (req, res) => {
  let typeQuery = new Parse.Query('assets_type');
  typeQuery.include('group');
  let roomQuery = new Parse.Query('room');
  roomQuery.include('building');
  let departmentQuery = new Parse.Query('department');
  let custodianQuery = new Parse.Query('custodian');
  let manufacturerQuery = new Parse.Query('manufacturer');
  let supplierQuery = new Parse.Query('supplier');

  let types = await typeQuery.find({ useMasterKey: true });
  let rooms = await roomQuery.find({ useMasterKey: true });
  let departments = await departmentQuery.find({ useMasterKey: true });
  let custodians = await custodianQuery.find({ useMasterKey: true });
  let manufacturers = await manufacturerQuery.find({ useMasterKey: true });
  let suppliers = await supplierQuery.find({ useMasterKey: true });

  return { types, rooms, departments, custodians, manufacturers, suppliers };
});

Parse.Cloud.define('goldy', (req, res) => {
  console.log(req.object);
  return req.params
})
