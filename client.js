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

let topics = ['home/kitchen', 'home/garage']
topics.forEach(function (topic) {
  client.on('/r/' + topic, function (raw) {
    let data = JSON.parse(raw)
    data['topic'] = topic
    data['date'] = (new Date()).toLocaleString().replace(',', '').trim()
    let instance = new Qoap(data)
    instance.save(function (err, savedChat) {
      if (err) console.log(err)
    })
    console.log(data)
  })
  client.emit('subscribe', topic)
})
