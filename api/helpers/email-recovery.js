const transporter = require("nodemailer").createTransport(require("../config/email"));
const { api: link } = require("../config/index");

module.exports = ({ user, recovery }, cb) => {
    const message = `
        <h1 style="text-align: center;">Recuperação de Senha</h1>
        <br />
        <p>
            Aqui está o link para redefinir a sua senha. Acesse ele e digite sua nova senha:
        </p>
        <a href="${link}/v1/api/users/password-recovery?token=${recovery.token}">
            ${link}/v1/api/users/password-recovery?token=${recovery.token}
        </a>
        <br /><br /><br />
        <p>
            Obs.: Se você não solicitou a redefinição, apenas ignore este email.
        </p>
        <br />
        <p>Atenciosamente, Laços da Cris</p>
    `;

    const optionsEmail = {
        from: "naoresponder@crislacos.com",
        to: user.email,
        subject: "Redefinição de Senha - Laços da Cris",
        html: message
    };

    if (process.env.NODE_ENV === "production" ) {
        transporter.sendMail(optionsEmail, (error, info) => {
            if (error) {
                console.log(error);
                return cb("Aconteceu um erro no envio do email, tente novamente.");
            } else {
                return cb(null, "Link para redefinição de senha foi enviado com sucesso para o seu email.");
            }
        });
    } else {
        console.log(optionsEmail);
        return cb(null, "Link para redefinição de senha foi enviado com sucesso para o seu email.");
    }
};