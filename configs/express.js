const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const fs = require('fs');
const glob = require('glob');


module.exports = function () {
    console.log('env - ' + process.env.NODE_ENV)
    let app = express();

    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }

    app.use(bodyParser.urlencoded({
        limit: "50mb",
        extended: true
    }));

    app.use(bodyParser.json());
    // Uncomment to force https
    // app.set('forceSSLOptions', {
    //   enable301Redirects: true,
    //   trustXFPHeader: false,
    //   httpsPort: 443,
    //   sslRequiredMessage: 'SSL Required.'
    // });
    // app.use(forceSSL);

    app.use(cors());
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.use(express.json());

    // ======= Routing
    const modules = '/../app/modules';
    glob(__dirname + modules + '/**/*Routes.js', {}, (err, files) => {
        files.forEach((route) => {
            const stats = fs.statSync(route);
            const fileSizeInBytes = stats.size;
            if (fileSizeInBytes) {
                require(route)(app, express);
            }
        });
    });

    return app;
};
