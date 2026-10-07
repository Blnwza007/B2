from browser import document, window, html, timer  # type: ignore[import-not-found]
import random, math

mode = 'fireworks'

canvas = html.CANVAS(width=window.innerWidth, height=window.innerHeight)
document <= canvas
canvas.width = window.innerWidth
canvas.height = window.innerHeight
ctx = canvas.getContext('2d')

canvas.style.display = 'block'

is_mobile = canvas.width < 600

small_stars = []
big_stars = []

n_small = 80 if is_mobile else 150
n_big = 15 if is_mobile else 30

for i in range(n_small):
    star = {
        'x': random.uniform(0, canvas.width),
        'y': random.uniform(0, canvas.height),
        'phase': random.uniform(0, 6.28),
        'speed': random.uniform(0.02, 0.06),
    }
    small_stars.append({**star, 'r': random.uniform(0.5, 1.2)})

for i in range(n_big):
    big_stars.append({
        'x': random.uniform(0, canvas.width),
        'y': random.uniform(0, canvas.height),
        'r': random.uniform(1.4, 2.2),
        'phase': random.uniform(0, 6.28),
        'speed': random.uniform(0.02, 0.05),
    })


def drawStars(ts):
    t = ts * 0.001 if ts else 0

    ctx.shadowBlur = 0
    for s in small_stars:
        alpha = 0.1 + 0.9 * (0.5 + 0.5 * math.sin(t * s['speed'] * 10 + s['phase']))
        ctx.beginPath()
        ctx.arc(s['x'], s['y'], s['r'], 0, 6.28)
        ctx.fillStyle = f'rgba(255,255,255,{alpha:.2f})'
        ctx.fill()

    ctx.shadowColor = 'rgba(200, 220, 255, 0.9)'
    for s in big_stars:
        twinkle = 0.5 + 0.5 * math.sin(t * s['speed'] * 10 + s['phase'])
        alpha = 0.05 + 0.95 * twinkle
        ctx.shadowBlur = s['r'] * 8 * twinkle

        ctx.beginPath()
        ctx.arc(s['x'], s['y'], s['r'], 0, 6.28)
        ctx.fillStyle = f'rgba(255,255,255,{alpha:.2f})'
        ctx.fill()

        if twinkle > 0.7:
            arm = s['r'] * 5 * twinkle
            ctx.shadowBlur = 0
            ctx.strokeStyle = f'rgba(255,255,255,{alpha * 0.5:.2f})'
            ctx.lineWidth = 0.8
            for angle in [0, 1.57]:
                ctx.beginPath()
                ctx.moveTo(s['x'] - math.cos(angle) * arm, s['y'] - math.sin(angle) * arm)
                ctx.lineTo(s['x'] + math.cos(angle) * arm, s['y'] + math.sin(angle) * arm)
                ctx.stroke()

    ctx.shadowBlur = 0


particles = []
for i in range(150):
    x = random.randint(0, canvas.width)
    y = random.randint(0, 300)
    speed = random.uniform(0.5, 3)
    radius = random.randint(3, 5)
    hue = random.randint(1, 360)
    phase = random.uniform(0, 6.28)
    particles.append([x, y, speed, radius, hue, phase])


def drawSnow():
    document.body.style.background = "#2a1030"
    for p in particles:
        ctx.shadowBlur = 15
        ctx.shadowColor = ctx.fillStyle

        p[4] = (p[4] + 1) % 360
        p[1] += p[2]
        p[0] += random.uniform(-0.2, 0.2)
        p[0] += math.sin(p[1] / 50 + p[5]) * 0.2
        p[0] = p[0] % canvas.width

        if p[1] > canvas.height:
            p[1] = 0
            p[0] = random.randint(0, canvas.width)
            p[2] = random.uniform(0.5, 3)
            p[3] = random.randint(3, 5)

        ctx.beginPath()
        ctx.arc(p[0], p[1], p[3], 0, 6.28)
        ctx.fillStyle = f'hsla({p[4]}, 100%, 70%, 1 )'
        ctx.fill()


meteors = []


def spawnMeteor():
    x = random.randint(canvas.width // 2, canvas.width)
    y = random.randint(0, canvas.height // 3)
    vx = random.randint(-14, -9)
    vy = random.randint(5, 9)
    meteors.append([x, y, vx, vy, 1])


def drawMeteors():
    global meteors
    alive = []
    for m in meteors:
        m[0] += m[2]
        m[1] += m[3]
        m[4] -= 0.02

        if m[4] > 0:
            tail_x = m[0] - m[2] * 3
            tail_y = m[1] - m[3] * 3
            ctx.strokeStyle = f'rgba(255, 255, 255, {m[4]})'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(m[0], m[1])
            ctx.lineTo(tail_x, tail_y)
            ctx.stroke()
            alive.append(m)

    meteors = alive


starPoints = []

for k in range(10):
    a = k * 6.28 / 10 - 1.57
    r = 1.0 if k % 2 == 0 else 0.4
    starPoints.append([math.cos(a) * r, math.sin(a) * r])

rockets = []


def launch(x, target_y):
    g = 0.15
    d = canvas.height - target_y
    vy = -math.sqrt(2 * g * d)
    hue = random.randint(0, 360)
    rockets.append([x, canvas.height, vy, target_y, hue])


def drawRockets():
    global rockets
    ctx.shadowBlur = 0
    alive = []
    for r in rockets:
        r[1] += r[2]
        r[2] += 0.15

        if r[1] <= r[3] or r[2] >= 0:
            explode(r[0], r[1], r[4])
        else:
            ctx.beginPath()
            ctx.arc(r[0], r[1], 5, 0, 6.28)
            ctx.fillStyle = f'hsla({r[4]}, 100%, 70%, 1 )'
            ctx.fill()
            alive.append(r)
            sparks.append([r[0], r[1], random.uniform(-0.5, 0.5), random.uniform(-0.5, 0.5), 1, r[4], 0.04])

    rockets = alive


sparks = []


def explode(x, y, hue):
    window.playExplosion()
    shape = random.choice(['star', 'circle',])
    burstDecay = random.uniform(0.008, 0.016)

    for i in range(100):
        if shape == 'star':
            k = i // 10
            f = (i % 10) / 10
            x1, y1 = starPoints[k]
            x2, y2 = starPoints[(k + 1) % 10]
            vx = (x1 + (x2 - x1) * f) * 5
            vy = (y1 + (y2 - y1) * f) * 5
            decay = burstDecay
        else:
            angle = random.uniform(0, 6.28)
            power = random.uniform(1, 6)
            vx = math.cos(angle) * power
            vy = math.sin(angle) * power
            decay = random.uniform(0.008, 0.016)

        sparks.append([x, y, vx, vy, 1, hue + random.randint(-20, 20), decay])


def drawFireworks():
    global sparks
    ctx.shadowBlur = 0
    alive = []
    for s in sparks:
        s[0] += s[2]
        s[1] += s[3]
        s[4] -= s[6]
        s[2] *= 0.985
        s[3] = s[3] * 0.985 + 0.06

        if s[4] > 0:
            alive.append(s)

        ctx.beginPath()
        ctx.arc(s[0], s[1], 3, 0, 6.28)
        ctx.fillStyle = f'hsla({s[5]}, 100%, 60%, {s[4]})'
        ctx.fill()

    sparks = alive


# ── Confetti ──────────────────────────────────────
confetti = []
CONFETTI_COLORS = [
    '#ff4fd8','#ffd54f','#4fc3f7','#aed581',
    '#ff8a65','#ba68c8','#4dd0e1','#fff176'
]

def spawnConfetti():
    cx = canvas.width / 2
    cy = canvas.height / 2
    for _ in range(180):
        angle = random.uniform(0, 6.28)
        speed = random.uniform(4, 14)
        confetti.append({
            'x': cx, 'y': cy,
            'vx': math.cos(angle) * speed,
            'vy': math.sin(angle) * speed - random.uniform(2, 6),
            'w': random.uniform(6, 12),
            'h': random.uniform(3, 6),
            'rot': random.uniform(0, 6.28),
            'rotV': random.uniform(-0.15, 0.15),
            'color': random.choice(CONFETTI_COLORS),
            'life': 1.0,
            'decay': random.uniform(0.004, 0.009),
        })

def drawConfetti():
    global confetti
    alive = []
    ctx.shadowBlur = 0
    for c in confetti:
        c['x'] += c['vx']
        c['y'] += c['vy']
        c['vy'] += 0.25          # gravity
        c['vx'] *= 0.99          # air drag
        c['rot'] += c['rotV']
        c['life'] -= c['decay']
        if c['life'] > 0:
            alive.append(c)
            ctx.save()
            ctx.translate(c['x'], c['y'])
            ctx.rotate(c['rot'])
            ctx.globalAlpha = c['life']
            ctx.fillStyle = c['color']
            ctx.fillRect(-c['w']/2, -c['h']/2, c['w'], c['h'])
            ctx.restore()
    ctx.globalAlpha = 1
    confetti = alive


def frame(ts):
    if mode == 'fireworks':
        if random.random() < 0.025:
            x = random.randint(0, canvas.width)
            if is_mobile:
                y = random.randint(canvas.height * 3 // 10, canvas.height * 6 // 10)
            else:
                y = random.randint(0, canvas.height * 7 // 10)
            launch(x, y)

        meteor_rate = 0.005 if is_mobile else 0.009
        if random.random() < meteor_rate:
            spawnMeteor()

        ctx.globalCompositeOperation = "destination-out"
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.globalCompositeOperation = "source-over"
        drawStars(ts)
        ctx.globalCompositeOperation = "lighter"
        drawRockets()
        drawFireworks()
        drawMeteors()
    elif mode == 'snow':
        ctx.globalCompositeOperation = "source-over"
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawSnow()
        drawConfetti()

    timer.request_animation_frame(frame)


def on_click(ev):
    launch(ev.clientX, ev.clientY)


canvas.bind("click", on_click)

def changeMode():
    global mode
    mode = 'snow'

def onCakeClick(e):
    spawnConfetti()
    timer.set_timeout(changeMode, 1500)

document["cakeWrap"].bind("click", onCakeClick)

timer.request_animation_frame(frame)
