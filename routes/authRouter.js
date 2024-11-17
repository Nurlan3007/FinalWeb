const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../modules/Users');
const router = express.Router();
const path = require('path');
const { error } = require('console');
const mailer = require('../mailer/sender');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const urlencodedParser = express.urlencoded({ extended: false });

router.get('/sign_up', (req, res) => {
    let errors = '';
    
    res.render('sign_in', { errors });
});

router.post('/sign_up_post', urlencodedParser, async (req, res) => {
    const { user_name, first_name, last_name, age, email, password, gender } = req.body;
    let errors = "";
    let role = "User";

    if (user_name.length <= 3 || first_name.length <= 1 || last_name.length <= 1) {
        errors += " Too short username or first name or last name\n";
    }

    if (password.length <= 1) {
        errors += " || Too short password";
    }

    if (gender == undefined) errors += "|| please choose gender";

    const user = await User.findOne({ email });
    if (user) {
        errors += " || Email is already exist";
    }

    if (errors.length > 0) {
        res.render('sign_in', { errors });
    } else {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({
                UserName: user_name,
                password: hashedPassword,
                FirstName: first_name,
                LastName: last_name,
                email: email,
                age: age,
                gender: gender,
                role: role
            });
            await user.save();
            mailer(email, first_name);

            const secret = speakeasy.generateSecret({
                length: 20,
                name: `PortfolioApp (${email})`,
            });
    
            const otpauthUrl = secret.otpauth_url;

            if (!otpauthUrl) {
                console.error('Не удалось сгенерировать otpauthUrl');
                return res.status(500).send('Ошибка генерации QR-кода');
            }else{
                qrcode.toDataURL(otpauthUrl, (err, dataUrl) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Error generating QR code');
                    }
    
                    res.render('two_factor_setup', { qrCode: dataUrl });
                });
            }

            let userA = '';
            res.render('main', { userA  });
        } catch (error) {
            console.log(error);
            res.status(500).send('Ошибка регистрации');
        }
    }
});

router.get('/login', (req, res) => {
    res.render('login', {});
});



router.get('/profile', urlencodedParser, async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('profile', { title: 'Профиль', user: req.session.user });
});



module.exports = router;
