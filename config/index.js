var configValues = require("./config");

var username = configValues.username;
var password = configValues.password;
module.exports = {
    

    getDbConnectionString: function(){
        return 'mongodb://' + username + ':' + password + '@ds131890.mlab.com:31890/car'
    }
}