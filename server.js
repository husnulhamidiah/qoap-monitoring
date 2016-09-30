let path = require('path')
let express = require('express')
let app = express()
let server = require('http').Server(app)
let io = require('socket.io')(server)
let at = require('at-quotes')

let socketClient = require('socket.io-client')
let client = socketClient.connect('http://192.168.1.5:3000', {reconnect: true})

let mongoose = require('mongoose')
mongoose.connect('mongodb://192.168.1.5:27017/qoap-db')

let qoapSchema = mongoose.Schema({
  topic: String,
  humidity: { type: Number, min: 0, max: 100 },
  temperature: { type: Number, min: 0, max: 100 },
  sensorId: Number,
  heap: Number,
  date: Date
})

let Qoap = mongoose.model('Qoap', qoapSchema)

io.on('connection', function (socket) {
  socket.on('subscribe', function (topic) {
    client.on('/r/' + topic, function (raw) {
      let data = JSON.parse(raw)
      data['topic'] = topic
      data['date'] = (new Date()).toLocaleString().replace(',', '').trim()
      console.log('Data ', data)
      let instance = new Qoap(data)
      instance.save(function (err, savedChat) {
        if (err) console.log(err)
        console.log('Saved instance ', savedChat)
      })
      socket.emit(topic, data)
    })
    client.emit('subscribe', topic)
  })
})

app.use(express.static('assets'))
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/views/index.html'))
})

server.listen(8000)
console.log(at.getQuote())
