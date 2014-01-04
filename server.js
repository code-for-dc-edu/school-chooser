// Module dependencies.
var application_root = __dirname,
    express = require('express'),
    fs = require('fs'),
    request = require('request'),
    hashids = require("hashids"),
    mongoose = require( 'mongoose' ),
    env = require('node-env-file');

// Load environment file if present
if (fs.existsSync('.env')) { env('.env'); }

// Create server
var app = express();

// Create hasher object
var hasher = new hashids("codefordc");

// Configure server
app.configure(function () {
    //parses request body and populates request.body
    app.use(express.json());
    app.use(express.urlencoded());

    //checks request.body for HTTP method overrides
    app.use(express.methodOverride());

    //perform route lookup based on url and HTTP method
    app.use(app.router);

    //Where to serve static content
    app.use(express.static(application_root + '/site'));

    //Show all errors in development
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// MongoDB
var mongoURL = process.env.MONGOHQ_URL || 'mongodb://localhost/school-chooser';

mongoose.connect(mongoURL, function (err, res) {
    if (!err) {
        console.log('Database connection established.');
    } else {
        console.log('ERROR: Problem connecting to database at ' + mongoURL + '. ' + err);
    }
});

// Schools
// var SchoolSchema = new mongoose.Schema({
//     code: Number,
//     name: String,
//     grades: { type: [String], index: true },
//     collegeEnrollment: {
//         val: Number,
//         sd: Number
//     },
//     commute: [
//         {
//             nc: Number,
//             val: Number,
//             sd: Number
//         }
//     ],
//     culture: {
//         val: {
//             attendance: Number,
//             suspensions: Number,
//             withdrawals: Number
//         },
//         sd: Number
//     },
//     diversity: {
//         val: {
//             a:  { type: Number, default: 0 }, // Asian
//             aa: { type: Number, default: 0 }, // African American
//             ai: { type: Number, default: 0 }, // American Indian / Alaskan Native
//             h:  { type: Number, default: 0 }, // Hispanic
//             mr: { type: Number, default: 0 }, // Two or more races
//             pi: { type: Number, default: 0 }, // Native Hawaiian / Pacific Islander
//             w:  { type: Number, default: 0 }  // White, non-Hispanic
//         },
//         sd: Number
//     },
//     graduationRate: {
//         val: Number,
//         sd: Number
//     },
//     growth: {
//         val: Number,
//         sd: Number
//     },
//     instructorRatio: {
//         val: Number,
//         sd: Number
//     }
// });

// var School = mongoose.model('School', SchoolSchema);

// Sessions
var SessionSchema = new mongoose.Schema({
    grade: String,
    address: String,
    addressGISValid: Boolean,
    xcoord: Number,
    ycoord: Number,
    neighborhoodCluster: Number,
    zonedSchools: [Number],
    rankings: {
        academicGrowth: Number,
        collegeEnrollment: Number,
        graduationRate: Number,
        instructionalStaffPerStudent: Number,
        racialDiversity: Number,
        schoolCulture: Number,
        studentsFromMyNeighborhood: Number
    }
},
{
    toJSON: {
        transform: function (doc, ret, options) {
            ret.hashid = hasher.encryptHex(doc.id);
            delete ret._id;
        }
    }
});

SessionSchema.statics.findByHashid = function (hashid, cb) {
    var id = hasher.decryptHex(hashid);
    return this.findById(id, cb);
};

SessionSchema.pre('save', function (next) {
    if (this.zonedSchools.length === 0 && this.addressGISValid) {
        // lookup zonedSchools
    }

    next();
});

var Session = mongoose.model('Session', SessionSchema);

// Routes
app.post('/api/dcgis', function (req, res) {
    var url = 'http://dcatlas.dcgis.dc.gov/wsProxy/proxy_LocVerifier.asmx/findLocation_all',
        str = req.body.address;
    request.post(url, {form: {str: str}}).pipe(res);
});

app.get('/api/sessions/:hashid', function (req, res) {
    return Session.findByHashid(req.params.hashid, function (err, session) {
        if (!err) {
            return res.send(session);
        } else {
            return console.log(err);
        }
    });
});

app.post('/api/sessions', function (req, res) {
    var session = new Session({
        grade: req.body.grade,
        address: req.body.address,
        addressGISValid: req.body.addressGISValid,
        xcoord: req.body.xcoord,
        ycoord: req.body.ycoord,
        neighborhoodCluster: req.body.neighborhoodCluster,
        zonedSchools: req.body.zonedSchools,
        rankings: req.body.rankings
    });

    session.save();
    return res.send(session);
});

app.put('/api/sessions/:hashid', function (req, res) {
    return Session.findByHashid(req.params.hashid, function (err, session) {
        session.grade = req.body.grade;
        session.address = req.body.address;
        session.addressGISValid = req.body.addressGISValid;
        session.xcoord = req.body.xcoord;
        session.ycoord = req.body.ycoord;
        session.neighborhoodCluster = req.body.neighborhoodCluster;
        session.zonedSchools = req.body.zonedSchools;
        session.rankings = req.body.rankings;
        
        return session.save(function (err) {
            if (err) { console.log(err); }
            return res.send(session);
        });
    });
});

// Start server
var port = process.env.PORT || 5000;
app.listen( port, function() {
    console.log( 'Express server listening on port %d in %s mode', port, app.settings.env );
});