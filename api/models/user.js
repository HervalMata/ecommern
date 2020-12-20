const mongoose = require("mongoose"), Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const secret = require("../config").secret;

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Não pode ficar vazio"]
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "Não pode ficar vazio"],
        index: true,
        match: [/\S+@\S+\.\S+/, 'É inválido.']
    },
    shop: {
        type: Schema.Types.ObjectId,
        ref: "Shop",
        required: [true, "Não pode ficar vazio"]
    },
    permission: {
        type: Array,
        default: ["cliente"]
    },
    hash: { type: String },
    salt: { type: String },
    recovery: {
        type: {
            token: String,
            date: Date
        },
        default: {}
    }
}, { timestamps: true } );

UserSchema.plugin(uniqueValidator, { message: "Já está sendo utilizado."});

UserSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString("hex");
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
};

UserSchema.methods.validatePassword = function (password) {
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
    return hash === this.hash;
};

UserSchema.methods.generateToken = function (string) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 15);

    return jwt.sign({
        id: this._id,
        email: this.email,
        name: this.name,
        exp: parseFloat(exp.getTime() / 1000, 10)
    }, secret);
};

UserSchema.methods.postAuthJSON = function () {
    return {
        id: this._id,
        email: this.email,
        name: this.name,
        shop: this.shop,
        role: this.permission,
        token: this.generateToken()
    };
};

UserSchema.methods.createTokenRecoveryPassword = function () {
    this.recovery = {};
    this.recovery.token = crypto.randomBytes(16).toString("hex");
    this.recovery.date = new Date( new Date().getTime() + 24*60*60*1000 );
    return this.recovery;
};

UserSchema.methods.finishTokenRecoveryPassword = function () {
    this.recovery = { token: null, date: null };
    return this.recovery;
};

module.exports = mongoose.model("User", UserSchema);