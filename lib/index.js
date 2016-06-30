const Simplex = require('simplex-noise')
const createRandom = require('@tatumcreative/random')
const lerp = require('lerp')
const { hslToStyle } = require('@tatumcreative/color')
const TAU = Math.PI * 2
const ease = require('eases/circ-out')
const shortcuts = require("./shortcuts")

;(function main () {
  const config = {
    maxDrips: 5000,
    dripsColor: 'rgba(50,255,255,0.1)',
    backgroundColor: hslToStyle(0.65, 0.4, 0.05),
    dimmingColor: hslToStyle(0.65, 0.4, 0.05, 0.03),
    dimmingChance: 0.05,
    dripsPerFrame: 2,
    dripGeneratorWidth: 20, //pixels
    dripStep: 2, //pixels
    dripSize: [3, 20],
    dripDirection: 0.5,
    dripDirectionalBias: 0.8,
    streams: [
      { center: 0.25, hue: 0.35 },
      { center: 0.5, hue: 0.5 },
      { center: 0.75, hue: 0.65 }
    ],
    dripHSLARange: [
      [0.0, 0.15],
      [0.8, 1.0],
      [0.5, 0.5],
      [0.1, 0.2]
    ],
    baseSlope: 0.00,
    landscapeXYScale: 0.005,
    landscapeShiftSpeed: 0.0001
  }

  const [canvas, ctx] = prepCanvasAndGetCtx(config)
  const seed = window.location.hash || Math.random()
  const random = createRandom(seed)
  shortcuts(seed)

  const current = {
    canvas,
    random,
    simplex: new Simplex(random),
    ctx,
    drips: [],
    time: 0
  }

  function loop() {
    current.time++
    addDripStream(config, current)
    moveDrips(config, current)
    drawScreenDimmer(config, current)
    drawDrips(config, current)
    requestAnimationFrame(loop)
  }
  loop()
})()

function addDripStream(config, current) {
  const { streams } = config

  streams.forEach(stream => {
    addNewDrips(config, current, stream.center, stream.hue)
  })
}

function addNewDrips (config, current, center, hue) {
  const {
    dripsPerFrame,
    maxDrips,
    dripGeneratorWidth,
    dripSize,
    dripHSLARange
  } = config
  const { drips, random } = current
  const w = window.innerWidth

  for (var i = 0; i < dripsPerFrame; i++) {
    if(drips.length >= maxDrips) {
      break
    }
    // Center new drips along the top of the screen.
    const x = w * center + random() * dripGeneratorWidth - dripGeneratorWidth / 2
    const y = 0
    const hsla = dripHSLARange.map(range => random(...range))
    hsla[0] += hue
    drips.push({
      x: x,
      y: y,
      px: x,
      py: y,
      size: random(...dripSize),
      color: hslToStyle(hsla)
    })

  }
}

function moveDrips (config, current) {
  const w = window.innerWidth
  const h = window.innerHeight
  const {
    baseSlope,
    dripStep,
    landscapeXYScale,
    landscapeShiftSpeed,
    dripDirection,
    dripDirectionalBias
  } = config
  const { drips, time, simplex } = current
  const t = time * landscapeShiftSpeed

  for (var i = 0; i < drips.length; i++) {
    const drip = drips[i]

    if(drip.y > h) {
      // Remove drips if they are off the screen
      drips.splice(i, 1)
      i--
    } else {
      // Move the drips
      const x = drip.x * landscapeXYScale
      const y = drip.y * landscapeXYScale
      let theta = 0.5 * (simplex.noise3D(x,y,t) + 1)

      theta = lerp(theta, ease(theta), dripDirectionalBias)
      theta = theta * TAU - TAU * dripDirection
      const mx = Math.cos(theta)
      const my = Math.sin(theta)

      drip.px = drip.x
      drip.py = drip.y
      drip.x += dripStep * mx
      drip.y += dripStep * my
    }
  }
}

function drawDrips (config, current) {
  const { drips, ctx } = current
  const { dripsColor, dripStep } = config

  drips.forEach(drip => {
    let dy = (dripStep + (drip.py - drip.y) / dripStep) / dripStep

    ctx.fillStyle = drip.color
    ctx.fillRect(
      drip.x - drip.size / 2,
      drip.y - drip.size / 2,
      drip.size * dy,
      drip.size * dy
    )
  })
}

function drawScreenDimmer (config, current) {
  const { ctx, canvas, random } = current
  const { dimmingColor, dimmingChance } = config

  if(random() < dimmingChance) {
    ctx.fillStyle = dimmingColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
}

function prepCanvasAndGetCtx(config) {
  const { backgroundColor } = config
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  document.body.appendChild(canvas)
  Object.assign(canvas.style, {
    position: 'absolute',
    top: '0px',
    left: '0px',
  })

  function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio
    canvas.height = window.innerHeight * window.devicePixelRatio
    canvas.style.width = window.innerWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'
    ctx.scale(
      window.devicePixelRatio,
      window.devicePixelRatio
    )
    console.log('coloring')
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0,0,canvas.width,canvas.height)
  }
  resize(), window.addEventListener('resize', resize, false)

  return [canvas, ctx]
}
