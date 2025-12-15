const connectToDatabase = require('../mongodb/connection.js');

module.exports = async function PrepareDatabase(req, res, next) {

    const InstalledDB = null;

    await connectToDatabase().then((client) => {
        if (typeof client === typeof InstalledDB) {
            console.log('Database connection established in middleware');
            return next();
        } else {
            return res.status(200).json({ status: false, type: 'error', message: "db connection didn't estabilished try again later." });
        }
    }).catch((error) => {
         return res.status(200).json({ status: false,
             type: 'error',
             message: "db connection didn't estabilished try again later.",
            error: error 
        });
    });



}
