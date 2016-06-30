var Keycode = require('keycode')

function click( selector ) {
  var el = document.querySelector( selector )
  if( el ) el.click()
}

module.exports = function shortcuts(seed) {
  console.log('adding shortcuts')
  window.addEventListener('keydown', function(event) {
    switch (Keycode(event)) {
      case "h":
        document.body.classList.toggle('hide-ui')
        break;
      case "r":
        window.location.reload()
        break;
      case "s":
        var canvas = document.querySelector('canvas')
        var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
        window.location.href = image;
        break;
      case "e":
        history.pushState(null, document.title, window.location.pathname + "#" + seed)
        break;
      case "f":
        if( document.fullscreenElement ) {
          document.exitFullscreen ? document.exitFullscreen() : null
        } else {
          var canvas = document.querySelector('canvas')
          canvas.requestFullscreen ? canvas.requestFullscreen() : null
        }
        break;
      case "left":
        click('#prev')
        break;
      case "right":
        click('#next')
        break;
    }
  }, false)

}
