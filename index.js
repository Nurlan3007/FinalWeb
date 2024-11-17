const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./routes/authRouter")
const Portfolio = require("./modules/portfolios");
const session = require('express-session');
const path = require('path');
const User = require('./modules/Users');
const bcrypt = require('bcrypt');
const app = express();
const multer = require('multer');
const portfolios = require("./modules/portfolios");

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/auth", authRouter);

app.use(
    session({
        secret: 'your secret key',  // Убедитесь, что ключ надежный
        saveUninitialized: true,
        resave: false,  // рекомендуется установить в false для предотвращения ненужных изменений сессии
        cookie: { secure: false }  // в development установите secure: false
    })
);



const urlencodedParser = express.urlencoded({extended: false});

const db = "mongodb+srv://maratnurlan3007:nurik3007@cluster0.xw7fh.mongodb.net/Final?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("MongoDB connection error: ", err));

app.get("/", async (req,res) => {
    const portfolioItems = await Portfolio.find();
    console.log(portfolioItems);
    let userA = req.session.user;

    res.status(200).render("main",{portfolioItems,userA});
});

app.get("/Portfolios", async (req,res) => {
    try {
        const portfolioItems = await Portfolio.find();
        let userA = req.session.user;

        for(let i = 0; i < portfolioItems.length; i++){
            let size_imgs = portfolioItems[i]['images'].length;
            console.log(portfolioItems[i]['_id']);
            console.log(portfolioItems[i]['title']);
            for(let j = 0; j < size_imgs; j++){
                console.log(portfolioItems[i]['images'][j])
            }
        }

        res.render('main', { portfolioItems, userA }); 
    } catch (err) {
        console.log(err);
        res.status(500).send('Error fetching portfolio items');
    }
});


app.get("/create", (req,res) => {
    res.status(200).render("create",{});
});

// app.post("/create_post",urlencodedParser, async (req,res) => {
//     const {title,description,image1, image2, image3} = req.body;
//     const portfolio = new Portfolio({ title: title, description: description,image1:image1,image2:image2,image3:image3});
//     await portfolio.save();
//     res.redirect('/');
// });

app.post('/login_post', urlencodedParser, async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
        
        req.session.user = { id: user._id, username: user.UserName, role: user.role };
        let userA = req.session.user;
        console.log(req.session.user);
        res.redirect("/");
    } else {
        res.status(401).send('Неверные данные');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        let userA='';
        res.render('main', {userA});
    });
});


// portfolio

function checkAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'Admin') {
        next();
    } else {
        res.status(403).send('Access Denied');
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public/uploads')); // Папка для сохранения файлов
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Имя файла
    }
});

app.get('/portfolio', async (req, res) => {
    const items = await Portfolio.find();
    res.render('portfolio', { items });
});

const upload = multer({ storage: storage });

app.post('/create_post', upload.array('images', 3), async (req, res) => {
    const { title, description } = req.body;
    const images = req.files.map(file => `/uploads/${file.filename}`);

    const portfolio = new Portfolio({
        title,
        description,
        images
       
    });
    await portfolio.save();

    try {
        await portfolio.save();
        let userA = '';
        const portfolioItems = await Portfolio.find();
        res.redirect("/"); // Перенаправление на главную страницу после добавления
    } catch (err) {
        console.log(err);
        res.status(500).send('Error saving portfolio item');
    }
});



app.get('/edit', async (req, res) => {
    _id = req.query.id;
    console.log(_id);
    const portfolioItem = await Portfolio.find({_id});
    console.log(portfolioItem);
    res.render('edit', { portfolioItem });
});

app.post('/update_post', urlencodedParser ,async (req, res) => {
    console.log(req.body);
    _id = req.body.id;
    const portfolio = await Portfolio.updateOne({_id : _id} , {$set: {title:req.body.title, description:req.body.description}});
    // res.redirect("/");
})



// apis

const axios = require('axios');
const newsApiKey = '9b3398ff5d6a47e19b9f2dae64cd2357';  
const currencyApiKey = '866153fa1ef35ba4aa41d764';  

app.get('/news', async (req, res) => {
    try {
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${newsApiKey}`);
        const news = response.data.articles;
        res.render('news', { news }); 
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).send('Error fetching news');
    }
});

app.get('/currency', async (req, res) => {
    try {
        const response = await axios.get(`https://v6.exchangerate-api.com/v6/${currencyApiKey}/latest/USD`);
        const rates = response.data.conversion_rates;
        res.render('currency', { rates });  
    } catch (error) {
        console.error('Error fetching currency data:', error);
        res.status(500).send('Error fetching currency data');
    }
});



PORT = 3000
NAME = "Localhost";

app.listen(PORT, () => {
    console.log(`${NAME}:${PORT}`);
});









