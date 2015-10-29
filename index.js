var app = require('express')();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname));

app.get('/', function(request, response) {
    response.sendFile('index.html');
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});