const smoothie = new SmoothieChart({ grid: { strokeStyle: 'rgb(125, 0, 0)', fillStyle: 'rgb(60, 0, 0)', lineWidth: 1, millisPerLine: 250, verticalSections: 6 }, maxValue: 100, minValue: 0 })
smoothie.streamTo(document.getElementById('smoothieCanvas'), 60000)
// connect to local ip address
let socket = io.connect('http://192.168.33.11:8000')

let field = document.getElementById('topic')
let sendButton = document.getElementById('send')

sendButton.onclick = function () {
  let topic = field.value
  let hue = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')'
  let linex = new TimeSeries()
  smoothie.addTimeSeries(linex, { strokeStyle: hue, lineWidth: 1 })
  $('#container').append('<h3>Topic : ' + topic + '</h3><table id=' + topic.replace(/[^A-Za-z0-9]/g, '_') + ' class="scroll"><thead><tr><th class="date">Date</th><th>Humidity</th><th>Temperature</th><th>Sensor ID</th><th>Topic</th></tr></thead><tbody></tbody></table><br>')
  socket.on(topic, function (data) {
    linex.append(new Date().getTime(), data.temperature)
    $('#' + topic.replace(/[^A-Za-z0-9]/g, '_') + ' > tbody:last-child')
      .append('<tr><td class="date">' + new Date(data.date).toLocaleString() +
        '</td><td>' + data.humidity +
        '</td><td>' + data.temperature +
        '</td><td>' + data.sensorId +
        '</td><td>' + data.topic + '</td></tr>')
    // console.log(data)
  })
  socket.emit('subscribe', topic)
}
