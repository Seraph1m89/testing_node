const settings = require("./config.json");
var env = process.env.NODE_ENV || "development";
if(env === "c9" || env === "development" || env === "test") {
    Object.keys(settings[env]).forEach(key => {
        process.env[key] = settings[env][key];
    });
}

// switch (env) {
//     case 'c9':
//         process.env.MONGODB_URI = "mongodb://localhost/todos";
//         break;
//     case 'development':
//         process.env.MONGODB_URI = "mongodb://localhost/todos";
//         process.env.PORT = 3000;
//         break;
//     case 'test':
//         process.env.PORT = 3000;
//         process.env.MONGODB_URI = "mongodb://localhost/todos_test";
//         break;
//     default:
//         // code
//}