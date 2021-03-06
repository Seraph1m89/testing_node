const {mongoose} = require("../database/db"),
      validator = require("validator"),
      jwt = require("jsonwebtoken"),
      _ = require("lodash"),
      bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: "{VALUE} is not a valid email"
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            require: true
        },
        token: {
            type: String,
            require: true
        }
    }]
});

userSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['email', '_id'])
};

userSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = "auth";

    var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.SALT);
    user.tokens.push({ access, token });

    return user.save().then(() => {
        return token;
    });
}

userSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, process.env.SALT);
    } catch (err) {
        return Promise.reject();
    }

    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
}

userSchema.statics.findByCredentials = function (email, password) {
    var User = this;
    var foundUser;

    return User.findOne({email})
    .then(user => {
        if(!user) {
            return Promise.reject();
        }

        foundUser = user;
        return bcrypt.compare(password, user.password);
    })
    .then(result => {
        if(result) {
            return Promise.resolve(foundUser);
        }

        return Promise.reject();
    })
    .catch(err => {
        return Promise.reject();
    });
}

userSchema.method("removeToken", function(token) {
    var user = this;

    return user.update({
        $pull: {
            tokens: {
                token
            }
        }
    });
});

userSchema.pre('save', function(next) {
    var user = this;

    if(user.isModified('password')) {
        bcrypt.genSalt(10)
        .then(salt => bcrypt.hash(user.password, salt))
        .then(hash => {
            user.password = hash;
            next();
        })
        .catch(err => next());
    } else {
        next();
    }
});

var User = mongoose.model("User", userSchema);

module.exports = {User};