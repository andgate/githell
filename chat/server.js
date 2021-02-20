const fs = require('fs')
const privateKey  = fs.readFileSync('sslcert/key.pem', 'utf8')
const certificate = fs.readFileSync('sslcert/cert.pem', 'utf8')
const credentials = {
  key: privateKey,
  cert: certificate
}
const express = require('express')
const app = express()
// const httpServer = require('http').Server(app)
const httpsServer = require('https').Server(credentials, app)
const io = require('socket.io')(httpsServer)
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room,  })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

const port = process.env.PORT || 3000
httpsServer.listen(port)
