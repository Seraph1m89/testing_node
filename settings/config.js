var env = process.env.NODE_ENV || "development";
console.log("env -----", env);
switch (env) {
    case 'c9':
        process.env.MONGODB_URI = "mongodb://localhost/todos";
        break;
    case 'development':
        process.env.MONGODB_URI = "mongodb://localhost/todos";
        break;
    case 'test':
        process.env.PORT = 3000;
        process.env.MONGODB_URI = "mongodb://localhost/todos_test";
        break;
    default:
        // code
}