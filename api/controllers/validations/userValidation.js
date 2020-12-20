const BaseJoi = require("joi");
const Extension = require("joi-date-extensions");
const Joi = BaseJoi.extend(Extension);

const UserValidation = {
    show: {
        params: {
            id: Joi.string().alphanum().length(24).required()
        }
    },
    store: {
        body: {
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().required(),
            shop: Joi.string().alphanum().length(24).required(),
        }
    },
    update: {
        body: {
            name: Joi.string().optional(),
            email: Joi.string().email().optional(),
            password: Joi.string().optional(),
        }
    },
    login: {
        body: {
            name: Joi.string().required(),
            password: Joi.string().required(),
        }
    }
};

module.exports = { UserValidation };