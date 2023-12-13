const express = require('express')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const app = express()
const secretText = 'superSecret'
const refreshSecretText = 'superRefresh'

const posts = [
  { username: 'John', title: 'Post 1' },
  { username: 'Han', title: 'Post 2' },
  { username: 'Han', title: 'Post 3' },
]
let refreshTokens = [];

app.use(express.json())
app.use(cookieParser())

app.post('/login', (req, res) => {
  const username = req.body.username;
  const user = { name: username }

  // jwt token 생성
  const accessToken = jwt.sign(user, secretText, { expiresIn: '30s' })

  // jwt refreshToken 생성
  const refreshToken = jwt.sign(user, refreshSecretText, { expiresIn: '1d' })
  refreshTokens.push(refreshToken);

  // refreshToken 쿠키에 넣어주기
  res.cookie('refresh', refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  });

  res.json({ accessToken: accessToken })
})

app.get('/posts', authMiddleware, (req, res) => {
  res.json(posts);
})

function authMiddleware(req, res, next) {
  // token을 request header에서 가져오기
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if(token === null) return res.sendStatus(401);

  // token 유효 확인
  jwt.verify(token, secretText, (err, user) => {
    if(err) return res.sendStatus(403)
    req.user = user;
    next();
  })
}

app.get('/refresh', (req, res) => {
  const cookies = req.cookies;
  if(!cookies?.refresh) return res.sendStatus(403);

  const refreshToken = cookies.refresh;

  // refreshToken이 DB에 있는지 확인
  if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  // refresh jwt 토큰 유효 확인
  jwt.verify(refreshToken, refreshSecretText, (err, user) => {
    if(err) return res.sendStatus(403);

    // 새로운 accessToken 생성
    const accessToken = jwt.sign({ name: user.name}, secretText, { expiresIn: '30s' })
    res.json({ accessToken });
  })
})

const port = 4000;
app.listen(port, () => {
  console.log('Server Start - Port =', port)
})