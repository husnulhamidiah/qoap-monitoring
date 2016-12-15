let linex = new TimeSeries()
let smoothie = new SmoothieChart({ grid: { strokeStyle: 'rgb(125, 0, 0)', fillStyle: 'rgb(60, 0, 0)', lineWidth: 1, millisPerLine: 250, verticalSections: 6 }, maxValue: 100, minValue: 0 })
smoothie.addTimeSeries(linex, { strokeStyle: 'rgb(0, 255, 0)', fillStyle: 'rgba(0, 255, 0, 0.4)', lineWidth: 3 })
smoothie.streamTo(document.getElementById('smoothieCanvas'), 60000)

// connect to local ip address
let socket = io.connect('http://192.168.33.11:8000')

let field = document.getElementById('topic')
let sendButton = document.getElementById('send')

sendButton.onclick = function () {
  let topic = field.value
  socket.on(topic, function (data) {
    linex.append(new Date().getTime(), data.temperature)
    console.log(data)
  })
  socket.emit('subscribe', topic)
}
