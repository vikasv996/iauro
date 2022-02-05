let swaggerUi = require('swagger-ui-express');
let basicAuth = require('basic-auth');
let path = require('path');
let fs = require('fs');
let config = require('./configs/configs');
let express = require('./configs/express');
let mongoose = require('./configs/mongoose');


let auth = function (req, res, next) {
    let user = basicAuth(req);
    if (!user || !user.name || !user.pass) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        res.sendStatus(401);
        return;
    }
    if (user.name === config.HTTPAuthUser && user.pass === config.HTTPAuthPassword) {
        next();
    } else {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.sendStatus(401);
    }
}

global.appRoot = path.resolve(__dirname);

db = mongoose();
const app = express();

app.get('/', function (req, res, next) {
    res.send('Home');
});

// Later moved this code snippet to dev
let options = {
    customCss: '.swagger-ui .models { display: none }',
    customSiteTitle: "IAURO APIs: " + process.env.NODE_ENV,
    swaggerOptions: {
        docExpansion: "none",
        tagsSorter: "alpha"
    }
};
let mainSwaggerData = JSON.parse(fs.readFileSync('swagger.json'));
mainSwaggerData.host = config.host;
mainSwaggerData.basePath = config.baseApiUrl;

const modules = './app/modules';
fs.readdirSync(modules).forEach(file => {
    if (fs.existsSync(modules + '/' + file + '/swagger.json')) {
        const stats = fs.statSync(modules + '/' + file + '/swagger.json');
        const fileSizeInBytes = stats.size;
        if (fileSizeInBytes) {
            let swaggerData = fs.readFileSync(modules + '/' + file + '/swagger.json');
            swaggerData = swaggerData ? JSON.parse(swaggerData) : { paths: {}, definitions: {} };
            mainSwaggerData.paths = { ...swaggerData.paths, ...mainSwaggerData.paths };
            mainSwaggerData.definitions = { ...swaggerData.definitions, ...mainSwaggerData.definitions };
        }
    }
});
if (config.isHTTPAuthForSwagger && config.isHTTPAuthForSwagger === 'true') {
    app.get("/docs", auth, (req, res, next) => {
        next();
    });
}
app.use('/docs', swaggerUi.serve, swaggerUi.setup(mainSwaggerData, options));

// Listening Server
let port = process.env.PORT || config.port;
app.listen(parseInt(port), async () => {
    console.log('process.env.NODE_ENV', process.env.NODE_ENV);
    console.log(`Server running at: ${port}`);
});