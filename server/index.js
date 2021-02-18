const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const config = require('./config/key');

const { auth } = require('./middleware/auth');
const { User } = require("./models/User");


// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World! 새해복많이받으세요')
})

app.post('api/register', (req, res) => {
    // 회원 가입 시 필요한 정보를 client에서 가져오면 데이터 베이스에 넣어줌

    const user = new User(req.body)

    user.save((err, userInfo) => {
        if(err) return res.json({ success: false, err })
        return res.status(200).json({
            success: true
        })
    })
})

app.post('api/login', (req, res) => {
    // 요청된 이메일이 데이터베이스에 있는지 찾는다
    User.findOne({email: req.body.email}, (err, useInfo) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }
    })
    // 요청된 이메일이 데이터 베이스에 있다면 비밀번호가 같은지 확인
    user.comparePassword(req.body, (err, isMatch) => {
        if(!isMatch)
        return req.json ({ loginSuccess: false, message: "비밀번호가 틀렸습니다."})

        user.generateToken((err, user) => {
            if (err) return res.status(400).send(err);

            // 토큰 저장 어디> 큐키, 로컬스토리지
            res.cookie("x_auth", user.tokem)
            .status(200)
            .json({loginSiccess: true, userId: user._id})
        })
    })
    // 비밀번호가 같다면 토큰 생성    
})

app.get('api/users/auth', auth, (req, res) => {
    // 여기까지 미들웨어를 통과해왔단는 건 Quthentication이 True라는 의미
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? flase : true,
        isAuth: true,
        email: req.user.emial,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})


app.get('api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id },
        {token: ""},
        (err, user) => {
            if(err) return res.json({ success: false, err });
            return res.status(200).send({
                success: true
            })
        })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})