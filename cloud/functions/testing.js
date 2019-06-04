// Parse.Cloud.beforeSave("example", req => {
//   req.object.get("columnName"); // gives the field of the requested object
//   req.object.set("columnName", value to set); // setting the field of the requested object
//   let query = new Parse.Query("some class");
//   query.equalTo("columnname", "requestedValue");
//   query.count(); // used to count the number of objects that match the query (Returns Promise)
//   query.find(); // used to find the objects that matches the query (Retuns Promise)
//   query.get(); // returns promise generally used to get single object like if ID is known
// });

Parse.Cloud.beforeSave("example", req => {
  const email = req.object.get("email");
  req.object.set(
    "email",
    email
      .split("")
      .reverse()
      .join("")
  );
});

// Parse.Cloud.beforeSave("example", (req, res) => {
//   let query = Parse.Query('other');
//   query.equalTo("first", req.params.firstname);
//   res.error("error from here");
// });
