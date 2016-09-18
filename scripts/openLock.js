'use strict'

let serial = require("./arduino");

module.exports = {
  start: (port) => serial.listen(port),
  controlOpening: (doOpen) => serial.setSignal(doOpen)
}
