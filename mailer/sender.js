const nodemailer = require('nodemailer');

// Настройка транспортера для использования с Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'maratnurlan3007@gmail.com',  
        pass: 'ukjm facp joam ktvd',  
    }
});

// Функция для отправки email
const sendWelcomeEmail = (recipientEmail, recipientName) => {
    const mailOptions = {
        from: 'maratnurlan3007@gmail.com',
        to: recipientEmail,
        subject: 'Добро пожаловать!',
        text: `Привет, ${recipientName}! Спасибо за регистрацию на нашем сайте. Мы рады, что ты с нами!`,
        html: `<h1>Добро пожаловать, ${recipientName}!</h1><p>Спасибо за регистрацию на нашем сайте. Мы рады, что ты с нами!</p>`
    };

    // Отправка email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Ошибка при отправке письма:', error);
        } else {
            console.log('Письмо отправлено: ' + info.response);
        }
    });
};

module.exports = sendWelcomeEmail;