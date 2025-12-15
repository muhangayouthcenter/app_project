const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./mongodb/connection.js');
const app = express();
const PORT = 2025;
const PrepareDatabase = require('./utils/prepare_database.js');


const res_changer = (req, res, next) => {
    //console.dir(res.json)
    return next()
    
}


const unexpected_error = (error, req, res, next) => {
    console.log(`Unexpected error`, error);
    return res.json({ status: false, type: 'error', message: "unexpected error occured!" });
}

const request_logger = (req, res, next) => {
    console.log(`\n\nUser-Agent --> ${req.rawHeaders[req.rawHeaders.indexOf('User-Agent') + 1]}`)
    console.log(`Content-Type --> ${req.rawHeaders[req.rawHeaders.indexOf('Content-Type') + 1]}`)
    console.log(`Content-Length --> ${req.rawHeaders[req.rawHeaders.indexOf('Content-Length') + 1]}`)
    return next();
}

app.use(res_changer);
app.use(request_logger);
app.use(PrepareDatabase);



app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use((req, res, next) => {
    res.setHeader('x-powered-by', 'Intel-G')
    return next();
})
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(unexpected_error);

app.use('/api', require('./routes/Router.js'));

app.use((req, res) => {
    console.log(this)
    res.status(404).json({ status: false, type: 'warning', message: "unknown_request.", envs: process.env.NODE_ENV || 'un_specified' });
});



// Global variable to hold the database connection
global.InstalledDB = null;


const Main = async () => {


    try {
        await connectToDatabase().then((client) => {
            if (typeof client === typeof InstalledDB) {
                app.listen(PORT, () => {
                    console.log(`Server is running on http://localhost:${PORT}`);
                    console.log('Real-time connection estabilished');
                });
            } else {
                console.error('Database connection failed. Server not started.');
                console.log(`Returned value: ${client}`);
                console.log(`IntalledDB value: ${InstalledDB}`);
                process.exit(1);
            }
        }).catch((error) => {
            console.error('Failed to start server:', error);
            process.exit(1);
        });
    } catch (error) {
        console.error('Unexpected error during server startup:', error);
        process.exit(1);
    }

}

Main();

exports.app = app;
module.exports =  app ;