const bcryptjs = require("bcryptjs");
const userService = require("../services/user.services");

exports.register = (req, res, next) => {
    const { password } = req.body;
    const salt = bcryptjs.genSaltSync(10);

    req.body.password = bcryptjs.hashSync(password, salt);

    userService.register(req.body, (error, result) => {
        if (error) {
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data: result,
        });
    });
};

exports.login = (req, res, next) => {
    const { phone, password } = req.body;

    userService.login({ phone, password }, (error, result) => {
        if (error) {
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data: result,
        });
    });
};

exports.userProfile = (req, res, next) => {
    return res.status(200).json({ message: "Authorized" });
};

exports.verify = (req, res, next) => {
    const { phone, otp } = req.body;
    userService.verify({ phone, otp }, (error, result) => {
        if (error) {
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data: result,
        });
    });
};
