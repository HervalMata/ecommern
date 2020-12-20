const mongoose = require("mongoose");
const User = mongoose.model("User");
const postEmailRecovery = require("../helpers/email-recovery");

class UserController {

    // GET /
    index(req, res, next) {
        User.findById(req.payload.id).then(user => {
            if (!user) return res.status(401).json({ errors: "Usuário não encontrado" });
            return res.json({ user: user.postAuthJSON() });
        }).catch(next);
    }

    // GET /:id
    show(req, res, next) {
        User.findById(req.params.id).populate({ path: "shop" })
            .then(user => {
                if (!user) return res.status(401).json({ errors: "Usuário não encontrado" });
                return res.json({
                    user: {
                        name: user.name,
                        email: user.email,
                        permission: user.permission,
                        shop: user.shop,
                    }
                });
            }).catch(next);
    }

    // POST /registrar
    store(req, res, next) {
        const { name, email, password, shop } = req.body;
        const user = new User({ name, email, shop });
        user.setPassword(password);
        user.save().then(() => res.json({ user: user.postAuthJSON() }))
            .catch((err) => {
                console.log(err);
                next(err);
            });
    }

    // PUT /
    update(req, res, next) {
        const { name, email, password } = req.body;
        User.findById(req.payload.id).then(user => {
            if (!user) return res.status(401).json({ errors: "Usuário não encontrado" });
            if (typeof name !== "undefined") user.name = name;
            if (typeof email !== "undefined") user.email = email;
            if (typeof password !== "undefined") user.setPassword(password);
            return user.save().then(() => {
                return res.json({ user: user.postAuthJSON() });
            }).catch(next);
        }).catch(next);
    }

    // DELETE /
    remove(req, res, next) {
        User.findById(req.payload.id).then(user => {
            if (!user) return res.status(401).json({ errors: "Usuário não encontrado" });
            return user.remove().then(() => {
                return res.json({ deleted: true });
            }).catch(next);
        }).catch(next);
    }

    // POST /login
    login(req, res, next) {
        const { email, password } = req.body;
        User.findOne({ email }).then(user => {
            if (!user) return res.status(401).json({ errors: "Usuário não encontrado" });
            if (!user.validatePassword(password)) return res.status(401).json({ errors: "Senha inválida" });
            return res.json({ user: user.postAuthJSON() });
        }).catch(next);
    }

    //RECOVERY

    // GET /recovery-password
    showRecovery(req, res, next) {
        return res.render('recovery', { error: null, success: null });
    }

    // POST /recovery-password
    createRecovery(req, res, next) {
        const { email } = req.body;
        if (!email) return res.render('recovery', { error: "Preencha com o seu email", success: null });
        User.findOne({ email }).then(user => {
            if (!user) return res.render('recovery', { error: "Não existe usuário com este email", success: null });
            const recoveryData = user.createTokenRecoveryPassword();
            return user.save().then(() => {
                postEmailRecovery({ user, recovery: recoveryData }, (error = null, success = null) => {
                    return res.render('recovery', { error, success });
                });
            }).catch(next);
        }).catch(next);
    }

    // GET /password-recovered
    showCompleteRecovery(req, res, next) {
        if (!req.query.token) return res.render('recovery', { error: "Token não identificado", success: null });
        User.findOne({ "recovery.token": req.query.token }).then(user => {
            if (!user) return res.render('recovery', { error: "Não existe usuário com este token", success: null });
            if (new Date(user.recovery.date) < new Date()) return res.render('recovery', { error: "Token expirado. Tente novamente", success: null });

            return res.render('recovery/store', { error: null, success: null, token: req.query.token });
        }).catch(next);
    }

    // POST /password-recovered
    completeRecovery(req, res, next) {
        const { token, password } = req.body;
        if (!token || !password) return res.render('recovery/store', { error: "Preencha novamente com sua nova senha", success: null, token: token });
        User.findOne({ "recovery.token": token }).then(user => {
            if (!user) return res.render('recovery', { error: "Não existe usuário com este token", success: null });
            user.finishTokenRecoveryPassword();
            user.setPassword(password);
            return user.save().then(() => {
                return res.render('recovery/store',
                    {
                        error: null,
                        success: "Senha alterada com sucesso. Tente fazer login novamente.",
                        token: null
                    });
            }).catch(next);
        });
    }
}

module.exports = UserController;