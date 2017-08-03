const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
const auth = {
    auth: {
        api_key: process.env.mailgun_api_key,
        domain: 'palingram.com'
    }
}

let sendEmail = (htmlData, email, subject, cb) => {
    const nodemailerMailgun = nodemailer.createTransport(mg(auth));
    let options = {
        from: 'Tradr <codemuhammed@gmail.com>',
        to: email, // An array if you have multiple recipients.
        // cc:'hello@palingram.com',
        // bcc:'hello@palingram.com',
        subject: subject,
        'h:Reply-To': 'codemuhammed@gmail.com',
        html: htmlData
    };

    nodemailerMailgun.sendMail(options, function (err, info) {
        if (err) {
            console.log(err);
            return cb(err, null);
        } else {
            console.log(info);
            return cb(null, info);
        }
    });
}

module.exports = {
    sendEmail
};
