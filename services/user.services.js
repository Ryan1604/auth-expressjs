const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const auth = require("../middlewares/auth");
const Axios = require("axios");

async function login({ phone, password }, callback) {
    const user = await User.findOne({ phone });
    var otp = Math.floor(1000 + Math.random() * 9000);

    User.updateOne({ phone: user.phone }, { otp: otp }, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("OTP di Update");
        }
    });

    var content = `Kode OTP Login Anda adalah ${otp}`;
    Axios.get(
        `https://api.zuwinda.com/v1.2/message/sms/send-text?content=${content}&token=6dd793e15b8c462186e9696ef944bcfb&to=${user.phone}`
    )
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });

    const newUser = await User.findOne({ phone });
    // User Ada
    if (newUser != null) {
        if (bcrypt.compareSync(password, newUser.password)) {
            const token = auth.generateAccessToken(phone);
            return callback(null, { ...newUser.toJSON(), token });
        } else {
            return callback({
                message: "Invalid Phone/Password",
            });
        }
    } else {
        return callback({
            message: "Invalid Phone/Password",
        });
    }
}

async function register(params, callback) {
    if (params.phone === undefined) {
        return callback({
            message: "Phone Number Required!",
        });
    }
    var otp = Math.floor(1000 + Math.random() * 9000);
    params.otp = otp;

    var content = `Kode OTP Anda adalah ${params.otp}`;

    Axios.get(
        `https://api.zuwinda.com/v1.2/message/sms/send-text?content=${content}&token=6dd793e15b8c462186e9696ef944bcfb&to=${params.phone}`
    )
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });

    const user = new User(params);
    user.save()
        .then((response) => {
            return callback(null, response);
        })
        .catch((error) => {
            return callback(error);
        });
}

async function verify({ phone, otp }, callback) {
    const user = await User.findOne({ phone });

    if (user.otp === otp) {
        return callback({
            message: "Congratulations",
        });
    } else {
        return callback({
            message: "Invalid OTP. Please Try Again",
        });
    }
}

module.exports = { login, register, verify };
