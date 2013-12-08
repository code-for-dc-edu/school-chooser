// Module dependencies.
var application_root = __dirname,
    express = require( 'express' ), //Web framework
    path = require( 'path' ), //Utilities for dealing with file paths
    request = require('request'), //Simple HTTP requests
    mongoose = require( 'mongoose' ); //MongoDB integration

//Create server
var app = express();

// Configure server
app.configure( function() {
    //parses request body and populates request.body
    app.use( express.bodyParser() );

    //checks request.body for HTTP method overrides
    app.use( express.methodOverride() );

    //perform route lookup based on url and HTTP method
    app.use( app.router );

    //Where to serve static content
    app.use( express.static( path.join( application_root, 'site') ) );

    //Show all errors in development
    app.use( express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// MongoDB
var mongoURI = process.env.MONGOHQ_URL || 'mongodb://localhost/school-chooser';

mongoose.connect(mongoURI, function (err, res) {
    if (!err) {
        console.log ('Connected to database at ' + mongoURI);
    } else {
        console.log ('ERROR connecting to database at ' + mongoURI + '. ' + err);
    }
});

// Schools
var School = new mongoose.Schema({
    code: Number,
    name: String,
    grades: [String],
    collegeEnrollment: {
        val: Number,
        sd: Number
    },
    commute: [
        {
            nc: Number,
            val: Number,
            sd: Number
        }
    ],
    culture: {
        val: {
            attendance: Number,
            suspensions: Number,
            withdrawals: Number
        },
        sd: Number
    },
    diversity: {
        val: {
            a:  { type: Number, default: 0 }, // Asian
            aa: { type: Number, default: 0 }, // African American
            ai: { type: Number, default: 0 }, // American Indian / Alaskan Native
            h:  { type: Number, default: 0 }, // Hispanic
            mr: { type: Number, default: 0 }, // Two or more races
            pi: { type: Number, default: 0 }, // Native Hawaiian / Pacific Islander
            w:  { type: Number, default: 0 }  // White, non-Hispanic
        },
        sd: Number
    },
    graduationRate: {
        val: Number,
        sd: Number
    },
    growth: [
        {
            grade: String,
            val: Number,
            sd: Number
        }
    ],
    instructorRatio: {
        val: Number,
        sd: Number
    }
});

var SchoolModel = mongoose.model('School', School);

// Sessions
var Session = new mongoose.Schema({
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
});

Session.virtual('results').get(function () {
    return; // STUB
});

var SessionModel = mongoose.model('Session', Session);

// Routes
app.post('/api/dcgis', function(req,res) {
    var url = 'http://dcatlas.dcgis.dc.gov/wsProxy/proxy_LocVerifier.asmx/findLocation_all',
        str = req.body.address;
    request.post(url, {form: {str: str}}).pipe(res);
});

// Start server
var port = 4711;
app.listen( port, function() {
    console.log( 'Express server listening on port %d in %s mode', port, app.settings.env );
});