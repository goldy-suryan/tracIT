let express = require('express');
let ParseServer = require('parse-server').ParseServer;
let bodyParser = require('body-parser');
const error = require('./server/middlewares/error');

// Parse configuration
var api = new ParseServer({
    databaseURI: 'mongodb://localhost:27017/dev',
    appId: process.env.APP_ID || 'myAppId',
    masterKey: process.env.MASTER_KEY || "myMasterKey",
    serverURL: process.env.SERVER_URI || 'http://localhost:1337/parse/'
});

// Set up express
var app = express();
app.use(express.static(__dirname + '/public'));
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.disable("x-powered-by");
app.use((req, res, next) => {
    res.header("Allow-Access-Control-Origin", "*");
    res.header(
        "Allow-Access-Control-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "POST, PUT, DELETE, PATCH, GET");
        res.status(200).json({});
    }
    next();
});

// Routes
require('./server/routes/app.routes')(app);

// Errors
app.use(error);

var port = process.env.PORT || 1337;
app.listen(port, () => {
    console.log(`http://localhost:1337`);
});