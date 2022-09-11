import joi from 'joi';

function signUpSchema(req, res, next) {
    const schema = joi.object({
        name: joi.string().empty().required(),
        email: joi.string().email().required(),
        password: joi.string().min(4).max(8).required(),
        confirm_password: joi.ref('password')
    });

    const validation = schema.validate(req.body, { abortEarly: false });
 
    if(validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        res.status(422).send(errors);
    }

    next();
}

function transactionSchema(req, res, next) {
    const schema = joi.object({
        value: joi.number().positive().precision(2).required(),
        description: joi.string().empty().required(),
        type: joi.valid('entrada', 'saida').required()
    });

    const validation = schema.validate(req.body, { abortEarly: false });

    if(validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        res.status(422).send(errors);
    }

    next();
}

export {
    signUpSchema,
    transactionSchema
}