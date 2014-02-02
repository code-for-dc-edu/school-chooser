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

SessionSchema.pre('save', true, function (next, done) {
    if (this.zonedSchools.length === 0 && this.addressGISValid) {
        var session = this,
            grade = parseInt(this.grade, 10),
            server = (grade >= 9) ? 3 : (grade >= 6) ? 2 : 4,
            url = 'http://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_APPS/EBIS/MapServer/'
                + server
                + '/query?f=json&returnGeometry=false&geometry=%7B%22x%22%3A%22'
                + this.xcoord
                + '%22%2C%22y%22%3A%22'
                + this.ycoord
                + '%22%7D&geometryType=esriGeometryPoint&outFields=GIS_ID';

        request(url, function (err, res, body) {
            if (!err && res.statusCode === 200) {
                var redirectUrl,
                    json = JSON.parse(body),
                    gisId = json.features[0].attributes["GIS_ID"],
                    match = gisId.match(/dcps_(.*)/);

                if (match) {
                    session.zonedSchools.push(parseInt(match[1]));
                    done();
                } else {
                    redirectUrl = "http://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_APPS/EBIS/MapServer/5/query?f=json&where=CLOSED_GIS_ID%20%3D%20'"
                        + gisId
                        + "'&returnGeometry=false&outFields=CLOSED_GIS_ID%2CREDIRECT_GIS_ID";
                    request(redirectUrl, function (err, res, body) {
                        if (!err && res.statusCode === 200) {
                            gisId = json.features[0].attributes["REDIRECT_GIS_ID"],
                            match = gisId.match(/dcps_(.*)/);
                            if (match) { session.zonedSchools.push(parseInt(match[1])); }
                        }
                        done();
                    });
                }
            }
        });

        next();
    } else {
        next();
        done();
    }
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

    return session.save(function (err) {
        if (err) { console.log(err); }
        return res.send(session);
    });
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
