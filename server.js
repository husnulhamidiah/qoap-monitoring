let path = require('path')
let express = require('express')
let app = express()
let server = require('http').Server(app)
let io = require('socket.io')(server)
let at = require('at-quotes')

let socketClient = require('socket.io-client')
// connect to middleware
let client = socketClient.connect('http://192.168.33.11:3000', {reconnect: true})

let mongoose = require('mongoose')
// coonnect to mongodb
mongoose.connect('mongodb://192.168.33.11:27017/qoap-db')

let qoapSchema = mongoose.Schema({
  topic: String,
  humidity: { type: Number, min: 0, max: 100 },
  temperature: { type: Number, min: 0, max: 100 },
  sensorId: Number,
  heap: Number,
  date: { type: Date, default: Date.now }
})

let Qoap = mongoose.model('Qoap', qoapSchema)

io.on('connection', function (socket) {
  socket.on('subscribe', function (topic) {
    Qoap.find({'topic': topic})
      .select('-_id')
      .limit(20)
      .exec(function (err, entities) {
        if (err) console.log(err)
        console.log(entities.length)
        entities.forEach(function (entity) {
          socket.emit(topic, entity)
        })
      })

    client.on('/r/' + topic, function (raw) {
      let data = JSON.parse(raw)
      data['topic'] = topic
      data['date'] = (new Date()).toLocaleString().replace(',', '').trim()
      let instance = new Qoap(data)
      instance.save(function (err, savedChat) {
        if (err) console.log(err)
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
