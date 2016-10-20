var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var config = require('./config');

var app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

var Item = require('./models/item');

app.get('/items', function(req, res) {
    Item.find(function(err, items) {
        if (err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.json(items);
    });
});

app.put('/items/:id', function(req, res) {
    var _id = mongoose.Types.ObjectId(req.params.id);
    Item.findOneAndUpdate({
        _id: _id
    }, {
        $set: {
            name: req.body.name
        }
    }, {
        new: true
    }, function(err, item) {
        if (err || !item) {
            console.error("Could not update item", req.body.name);
            mongoose.disconnect();
            if (err) {
                return res.status(500).json({
                    message: 'Internal Server Error'
                })
            }
        }
        console.log("Updated item", item.name);
        res.status(201).json(item);
    });
})

app.post('/items', function(req, res) {
    Item.create({
        name: req.body.name
    }, function(err, item) {
        if (err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.status(201).json(item);
    });
});


app.delete('/items/:id', function(req, res) {
    var _id = mongoose.Types.ObjectId(req.params.id);
    Item.remove({
        _id: _id
    }, function(err, item) {
        if (err || !item) {
            console.error("Could not delete item", req.body.name);
            mongoose.disconnect();
            return;
        }
        console.log("Deleted item", item.result);
        res.status(201).json(item);
    });
})



app.use('*', function(req, res) {
    res.status(404).json({
        message: 'Not Found'
    });
});

var runServer = function(callback) {
    mongoose.connect(config.DATABASE_URL, function(err) {
        if (err && callback) {
            return callback(err);
        }

        app.listen(config.PORT, function() {
            console.log('Listening on localhost:' + config.PORT);
            if (callback) {
                callback();
            }
        });
    });
};

if (require.main === module) {
    runServer(function(err) {
        if (err) {
            console.error(err);
        }
    });
};

exports.app = app;
exports.runServer = runServer;