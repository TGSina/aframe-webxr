# Exercise 0 – A-Frame / WebXR Part
## Complete Guide: Concepts, Setup, Code, Testing and Sharing

**Course:** Introduction to Virtual and Augmented Reality and their Usages in Medical Systems and Data
**Scope of this document:** the web-based (A-Frame / WebXR) half of Exercise 0. The Unity AR half is documented separately.
**A-Frame version used:** 1.7.1 (local file `aframe-v1.7.1.min.js`)

> **Purpose of this exercise:** get familiar with web-based XR development *before* Exercise 3 (VR Exposure Therapy). Students set up the tools, build one interactive VR scene and one markerless AR scene, and learn how to test them on a laptop and on an Android phone, locally (HTTP) and securely (HTTPS).

---

## Table of Contents

1. [Concepts: the web XR stack](#1-concepts-the-web-xr-stack)
2. [A-Frame vs Unity (mental mapping)](#2-a-frame-vs-unity-mental-mapping)
3. [What works where (browser / OS compatibility)](#3-what-works-where-browser--os-compatibility)
4. [What to download and install](#4-what-to-download-and-install)
5. [Project setup (step by step)](#5-project-setup-step-by-step)
6. [Part A – VR scene: `index.html`](#6-part-a--vr-scene-indexhtml)
7. [Part B – Markerless AR scene: `index2.html`](#7-part-b--markerless-ar-scene-index2html)
8. [Testing on the laptop](#8-testing-on-the-laptop)
9. [Sharing 1 – Local network over HTTP](#9-sharing-1--local-network-over-http)
10. [Sharing 2 – HTTPS with ngrok](#10-sharing-2--https-with-ngrok)
11. [Sharing 3 – HTTPS with GitHub Pages](#11-sharing-3--https-with-github-pages)
12. [Optional: Chrome USB port-forwarding trick](#12-optional-chrome-usb-port-forwarding-trick)
13. [Which sharing method should I use?](#13-which-sharing-method-should-i-use)
14. [Troubleshooting](#14-troubleshooting)
15. [Suggested student tasks and deliverables](#15-suggested-student-tasks-and-deliverables)
16. [Links to the official documentation](#16-links-to-the-official-documentation)

---

## 1. Concepts: the web XR stack

Web-based XR is built in layers. Each layer is a separate project that builds on the one below.

| Layer | What it is | Its job |
|---|---|---|
| **HTML / CSS / JavaScript + browser** | The platform | Runs the page. No installation and no build step for the user |
| **WebGL (and WebGPU)** | Browser graphics API | Draws triangles on the GPU |
| **Three.js** | JavaScript 3D library | Scene graph, cameras, meshes, lights, materials, loaders, on top of WebGL |
| **WebXR Device API** | A browser standard | Gives access to the headset or phone pose, stereo rendering, and (for AR) features such as hit-test. It **does not draw anything** |
| **A-Frame** | Framework on top of Three.js | Declarative HTML tags (`<a-scene>`, `<a-box>`) built on an entity-component system. It also handles the WebXR session for you |

**One-sentence summary:** *A-Frame is HTML for Three.js; Three.js draws using WebGL; WebXR provides head/phone tracking and the immersive session.*

### Key ideas

- **Entity-Component-System (ECS).** Everything in a scene is an *entity* (`<a-entity>` or a primitive like `<a-box>`). Entities get behaviour and appearance by attaching *components* (`position`, `material`, `light`, `cursor`, our own `selectable`...). Components have a *schema* (their properties).
- **A-Frame includes Three.js.** The single A-Frame file bundles its own copy of Three.js, so no separate download is needed. Every entity has a Three.js object behind it: `el.object3D`. Students can drop to Three.js whenever A-Frame's attributes are not enough.
- **Coordinate system (metres).** `x` right, `y` up, **`-z` forward**. In AR, 1 unit = 1 real metre.
- **Events.** Entities talk through DOM events (`click`, `mouseenter`, `enter-vr`, `ar-hit-test-select`...), just like a normal web page.
- **Secure context.** WebXR (and, on iOS, motion sensors) only work on **HTTPS** (or `localhost`). This is why Sections 10 and 11 exist.

---

## 2. A-Frame vs Unity (mental mapping)

| Topic | Unity | A-Frame / web |
|---|---|---|
| Authoring | Visual editor, Hierarchy, Inspector | Text file (HTML) + the A-Frame Inspector (`Ctrl+Alt+I`) |
| Scene object | GameObject | `<a-entity>` |
| Behaviour | C# MonoBehaviour (`Start`, `Update`) | JS component (`init`, `tick`) via `AFRAME.registerComponent` |
| Inspector fields | `public` variables | Component `schema` |
| Parent / child | Transform hierarchy | Nested tags |
| Forward axis | +Z | **-Z** |
| UI | Canvas / UI Toolkit | HTML + CSS (DOM overlay in AR) |
| Delivery | Build an app (`.apk`), needs SDK/NDK/JDK | Share a URL, nothing to install |
| AR features | AR Foundation / ARCore: planes, images, anchors, meshes | WebXR: hit-test, anchors, light estimation (browser dependent) |
| Platforms | Android and iOS | Browser dependent (see next section) |
| Heavy assets | Handles large medical meshes well | Keep models small |
| Best for | Complex, heavy apps (Exercise 1, 2) | Fast prototypes, easy sharing (Exercise 3) |

---

## 3. What works where (browser / OS compatibility)

**A scene working on a laptop does not guarantee that it works on a phone.** There are three separate questions:

1. **Does it render?** (A-Frame / Three.js / WebGL) – works in all modern browsers including Safari. If it shows on the laptop, it almost always shows on the phone. Typical problems: performance, big textures, audio/video autoplay rules.
2. **Is WebXR available?** (VR button, stereo mode, AR) – depends on the browser and OS.
3. **Is the page on HTTPS?** – WebXR needs a *secure context*. `localhost` counts as secure on the same machine; `http://192.168.x.x` on a phone does **not**.

| Device / browser | 3D scene renders | Stereo VR mode (WebXR) | AR (WebXR `immersive-ar`) |
|---|---|---|---|
| Laptop Chrome / Edge | Yes | Yes (with a headset or the Immersive Web Emulator) | Only with the emulator |
| Laptop Firefox | Yes | Needs a headset | No |
| **Android Chrome** | Yes | **Yes (HTTPS)** | **Yes (HTTPS, ARCore phone)** |
| Android Firefox | Yes (touch / gyro look-around) | No usable WebXR mode | No |
| iPhone / iPad Safari | Yes (look around by touch, gyro after permission on HTTPS) | No | No |
| iPhone Chrome / Firefox | Same as Safari (all iOS browsers use Apple's WebKit engine) | No | No |

**Consequences for the course**

- Everything in Part A works for everyone as a normal 3D page; the stereo VR button needs Android Chrome on HTTPS.
- **Part B (AR) needs an Android phone with Chrome and ARCore (Google Play Services for AR).** Students with iPhones should team up with an Android owner or use the emulator.
- Always pin one A-Frame version for the whole class.
- Always test on at least one real phone. Phone and ARCore support varies by device.

---

## 4. What to download and install

| # | Item | Why | Where |
|---|---|---|---|
| 1 | **Visual Studio Code** | Code editor | code.visualstudio.com |
| 2 | **Live Server** extension (Ritwick Dey) | Local web server, "Go Live" button, auto reload | VS Code Extensions panel |
| 3 | **Auto Rename Tag** extension | Renames the closing tag with the opening tag | VS Code Extensions panel |
| 4 | **Prettier** extension (optional) | Code formatting | VS Code Extensions panel |
| 5 | **A-Frame 1.7.1** file | The library | `https://aframe.io/releases/1.7.1/aframe.min.js` (or the A-Frame GitHub releases) |
| 6 | **Google Chrome** (laptop) | Main test browser | google.com/chrome |
| 7 | **Firefox** (laptop) | Second browser for comparison | mozilla.org |
| 8 | **Immersive Web Emulator** (Meta) | Emulates a WebXR headset (and AR) in the desktop browser | Chrome Web Store / Edge Add-ons |
| 9 | **Chrome on an Android phone** + Google Play Services for AR | Real VR/AR testing | Play Store |
| 10 | **ngrok** account + agent | Temporary HTTPS link | ngrok.com |
| 11 | **GitHub** account (and Git or GitHub Desktop) | Permanent HTTPS link | github.com |

No Node.js, no npm and no build tools are needed.

### Immersive Web Emulator (Meta)

- A **desktop** browser extension. It injects a WebXR runtime so the laptop behaves as if a Meta Quest headset were present.
- Available from the Chrome Web Store and Edge Add-ons. It is not installable on phone browsers (mobile Chrome does not run extensions).
- Firefox is not officially supported (a community fork exists); use Chrome or Edge.
- How to use: install it, open your page, press **F12**, and open the **Immersive Web Emulator** tab in DevTools. The page's VR/AR buttons become active and you can move the emulated headset and controllers.
- It is for testing XR logic without hardware. It does **not** replace testing on a real phone.

### A-Frame Inspector

On any A-Frame page press **`Ctrl + Alt + I`** to open a visual editor. You can select entities, drag them, and change attributes live. It is the closest thing to Unity's Scene view. Changes are not saved to your file; copy the values back into the HTML.

---

## 5. Project setup (step by step)

### 5.1 Create the folder structure

Create a simple folder (avoid spaces in the path):

```
exe0-aframe/
├── index.html              (Part A: VR scene)
├── index2.html             (Part B: markerless AR scene)
├── libs/
│   └── aframe-v1.7.1.min.js
└── assets/
    ├── models/             (.glb files, optional)
    ├── images/             (equirectangular .jpg, optional)
    └── sounds/             (optional)
```

In VS Code use **File → Open Folder → exe0-aframe**. Open the *folder*, not a single file, because Live Server serves the folder root.

### 5.2 Download A-Frame locally

1. Open `https://aframe.io/releases/1.7.1/aframe.min.js` in the browser, right-click → **Save as**. (If the URL fails, take the file from the A-Frame GitHub releases page.)
2. Rename it `aframe-v1.7.1.min.js` and put it in `libs/`.

A local file pins the version for the whole class and works offline. (CDN alternative: `<script src="https://aframe.io/releases/1.7.1/aframe.min.js"></script>`.)

### 5.3 Why Live Server and not double-clicking the file?

Opening a file with `file://` makes browsers block loading other local files such as `.glb` models. Live Server serves the folder as `http://127.0.0.1:5500` so it behaves like a real website, and it reloads the page every time you save.

### 5.4 Sanity test

Create `index.html` with this minimal page, click **Go Live** (bottom-right of VS Code), and check that you see a blue box:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Exe0 Setup Test</title>
  <script src="libs/aframe-v1.7.1.min.js"></script>
</head>
<body>
  <a-scene>
    <a-box position="0 1.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
    <a-sky color="#ECECEC"></a-sky>
  </a-scene>
</body>
</html>
```

**Checklist**

- [ ] Blue box visible, no errors in the console (`F12` → Console)
- [ ] Drag to look around, `WASD` to move
- [ ] The VR goggles button appears at the bottom-right
- [ ] `Ctrl + Alt + I` opens the Inspector

---

## 6. Part A – VR scene: `index.html`

An interactive "mini lab": a table with four selectable objects, a floating decorative shape and a 3D control panel. The user aims the centre ring at an object and clicks (or gazes) to select it, then uses the panel buttons to rotate, move or scale it.

### 6.1 Full code

Replace `index.html` with:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Exe 0 - Mini VR Lab</title>

  <!-- 1) A-Frame library (local file, includes Three.js) -->
  <script src="libs/aframe-v1.7.1.min.js"></script>

  <!-- 2) Our own custom components (must come AFTER A-Frame) -->
  <script>
    // ---------- Helper functions ----------
    // Turn a yellowish glow on/off for every mesh inside an entity.
    // traverse() is a Three.js method: it visits the object and all its children.
    function setGlow(el, on) {
      el.object3D.traverse((node) => {
        if (node.isMesh && node.material && node.material.emissive) {
          node.material.emissive.set(on ? 0x555500 : 0x000000);
        }
      });
    }

    // Update the status text in the scene
    function setStatus(text) {
      const status = document.querySelector('#status');
      status.setAttribute('text', 'value', 'Selected: ' + text);
    }

    // ---------- Component 1: selectable ----------
    // Put on any object that can be selected by clicking/gazing at it.
    AFRAME.registerComponent('selectable', {
      schema: { label: { type: 'string', default: 'object' } },

      init: function () {
        const el = this.el;
        const scene = el.sceneEl;

        el.addEventListener('click', () => {
          const previous = scene.selected;       // what was selected before?
          if (previous) setGlow(previous, false);

          if (previous === el) {                 // clicked the same object again: deselect
            scene.selected = null;
            setStatus('none');
            return;
          }
          scene.selected = el;                   // remember the new selection
          setGlow(el, true);
          setStatus(this.data.label);
        });
      }
    });

    // ---------- Component 2: control-button ----------
    // A 3D button that transforms the currently selected object.
    AFRAME.registerComponent('control-button', {
      schema: { action: { type: 'string' } },

      init: function () {
        const el = this.el;
        const scene = el.sceneEl;
        const STEP = 0.2;       // metres per move click
        const ANGLE = 15;       // degrees per rotate click
        const FACTOR = 1.15;    // scale change per click
        const degToRad = AFRAME.THREE.MathUtils.degToRad;

        // Hover feedback (also works for gaze)
        el.addEventListener('mouseenter', () => el.object3D.scale.set(1.1, 1.1, 1.1));
        el.addEventListener('mouseleave', () => el.object3D.scale.set(1, 1, 1));

        el.addEventListener('click', () => {
          const target = scene.selected;
          if (!target) return;                   // nothing selected
          const o = target.object3D;

          switch (this.data.action) {
            case 'rot-left':  o.rotation.y += degToRad(ANGLE);  break;
            case 'rot-right': o.rotation.y -= degToRad(ANGLE);  break;
            case 'left':      o.position.x -= STEP;             break;
            case 'right':     o.position.x += STEP;             break;
            case 'up':        o.position.y += STEP;             break;
            case 'down':      o.position.y -= STEP;             break;
            case 'forward':   o.position.z -= STEP;             break;
            case 'back':      o.position.z += STEP;             break;
            case 'bigger':    o.scale.multiplyScalar(FACTOR);   break;
            case 'smaller':   o.scale.multiplyScalar(1 / FACTOR); break;
          }
        });
      }
    });

    // ---------- Component 3: gaze-in-vr ----------
    // Click-only on desktop/phone, but turn on gaze (fuse) clicking
    // as soon as we enter VR, because no mouse or touch exists there.
    AFRAME.registerComponent('gaze-in-vr', {
      init: function () {
        const scene = this.el.sceneEl;
        scene.addEventListener('enter-vr', () => this.el.setAttribute('cursor', 'fuse', true));
        scene.addEventListener('exit-vr',  () => this.el.setAttribute('cursor', 'fuse', false));
      }
    });
  </script>
</head>

<body>
  <a-scene>

    <!-- ================= ASSETS ================= -->
    <a-assets timeout="30000">

      <!-- ★ REPLACE POINT 1A (sky image): uncomment, put your file in assets/images/ -->
      <!-- <img id="skyImg" src="assets/images/panorama.jpg"> -->

      <!-- ★ REPLACE POINT 2A (3D model): uncomment, put your file in assets/models/ -->
      <!-- <a-asset-item id="organModel" src="assets/models/organ.glb"></a-asset-item> -->

    </a-assets>

    <!-- ================= ENVIRONMENT ================= -->

    <!-- Built-in sky: a plain colour -->
    <a-sky color="#0d1b2a"></a-sky>

    <!-- ★ REPLACE POINT 1B: delete the a-sky above and uncomment this one -->
    <!-- <a-sky src="#skyImg" rotation="0 -90 0"></a-sky> -->

    <!-- Lights -->
    <a-entity light="type: ambient; intensity: 0.6; color: #ffffff"></a-entity>
    <a-entity light="type: directional; intensity: 0.9; color: #ffffff" position="2 4 3"></a-entity>

    <!-- Floor -->
    <a-plane rotation="-90 0 0" width="30" height="30" color="#1b263b"></a-plane>

    <!-- Table -->
    <a-box position="0 0.8 -4" width="5.5" height="0.2" depth="2" color="#2f3e46"></a-box>

    <!-- Title sign -->
    <a-text value="Exe 0 - Mini VR Lab" position="0 2.9 -4" align="center" width="7" color="#ffffff"></a-text>

    <!-- Decorative spinning shape (NOT clickable) -->
    <a-octahedron position="0 2.3 -4" radius="0.3" color="#e0aaff"
      animation="property: rotation; to: 0 360 0; dur: 6000; easing: linear; loop: true">
    </a-octahedron>

    <!-- ================= SELECTABLE OBJECTS ================= -->

    <!-- Sphere (stands in for an organ) -->
    <a-sphere class="clickable" selectable="label: Sphere (organ placeholder)"
      position="-1.8 1.3 -4" radius="0.4" color="#e63946"></a-sphere>

    <!-- ★ REPLACE POINT 2B: delete the sphere above and uncomment this entity.
         Many biomedical models are huge or tiny: adjust scale (e.g. 0.01 or 10) -->
    <!--
    <a-entity class="clickable" selectable="label: Biomedical model"
      gltf-model="#organModel" position="-1.8 1.3 -4" scale="1 1 1"></a-entity>
    -->

    <!-- Box -->
    <a-box class="clickable" selectable="label: Box"
      position="-0.6 1.2 -4" width="0.6" height="0.6" depth="0.6" color="#457b9d"></a-box>

    <!-- Cylinder -->
    <a-cylinder class="clickable" selectable="label: Cylinder"
      position="0.6 1.3 -4" radius="0.3" height="0.8" color="#2a9d8f"></a-cylinder>

    <!-- Cone -->
    <a-cone class="clickable" selectable="label: Cone"
      position="1.8 1.3 -4" radius-bottom="0.35" radius-top="0" height="0.8" color="#f4a261"></a-cone>

    <!-- ================= CONTROL PANEL ================= -->
    <a-entity position="0 0.7 -1.5" rotation="-35 0 0">

      <!-- Status text -->
      <a-text id="status" value="Selected: none" position="0 0.6 0"
        align="center" width="3" color="#ffff66"></a-text>

      <!-- Panel background (not clickable) -->
      <a-box width="3" height="0.8" depth="0.02" color="#000000" opacity="0.6"></a-box>

      <!-- Row 1 -->
      <a-box class="clickable" control-button="action: rot-left" position="-1.1 0.17 0.03"
        width="0.5" height="0.25" depth="0.05" color="#3a86ff"
        text="value: ROT -; align: center; width: 1.5; color: white; zOffset: 0.03"></a-box>
      <a-box class="clickable" control-button="action: rot-right" position="-0.55 0.17 0.03"
        width="0.5" height="0.25" depth="0.05" color="#3a86ff"
        text="value: ROT +; align: center; width: 1.5; color: white; zOffset: 0.03"></a-box>
      <a-box class="clickable" control-button="action: left" position="0 0.17 0.03"
        width="0.5" height="0.25" depth="0.05" color="#8338ec"
        text="value: LEFT; align: center; width: 1.5; color: white; zOffset: 0.03"></a-box>
      <a-box class="clickable" control-button="action: right" position="0.55 0.17 0.03"
        width="0.5" height="0.25" depth="0.05" color="#8338ec"
        text="value: RIGHT; align: center; width: 1.5; color: white; zOffset: 0.03"></a-box>
      <a-box class="clickable" control-button="action: bigger" position="1.1 0.17 0.03"
        width="0.5" height="0.25" depth="0.05" color="#06a77d"
        text="value: BIG; align: center; width: 1.5; color: white; zOffset: 0.03"></a-box>

      <!-- Row 2 -->
      <a-box class="clickable" control-button="action: up" position="-1.1 -0.17 0.03"
        width="0.5" height="0.25" depth="0.05" color="#fb5607"
        text="value: UP; align: center; width: 1.5; color: white; zOffset: 0.03"></a-box>
      <a-box class="clickable" control-button="action: down" position="-0.55 -0.17 0.03"
        width="0.5" height="0.25" depth="0.05" color="#fb5607"
        text="value: DOWN; align: center; width: 1.5; color: white; zOffset: 0.03"></a-box>
      <a-box class="clickable" control-button="action: forward" position="0 -0.17 0.03"
        width="0.5" height="0.25" depth="0.05" color="#ff006e"
        text="value: FWD; align: center; width: 1.5; color: white; zOffset: 0.03"></a-box>
      <a-box class="clickable" control-button="action: back" position="0.55 -0.17 0.03"
        width="0.5" height="0.25" depth="0.05" color="#ff006e"
        text="value: BACK; align: center; width: 1.5; color: white; zOffset: 0.03"></a-box>
      <a-box class="clickable" control-button="action: smaller" position="1.1 -0.17 0.03"
        width="0.5" height="0.25" depth="0.05" color="#06a77d"
        text="value: SMALL; align: center; width: 1.5; color: white; zOffset: 0.03"></a-box>
    </a-entity>

    <!-- ================= CAMERA + CURSOR ================= -->
    <a-camera position="0 1.6 0">
      <a-entity
        cursor="fuse: false; fuseTimeout: 1500"
        raycaster="objects: .clickable; far: 20"
        position="0 0 -1"
        geometry="primitive: ring; radiusInner: 0.015; radiusOuter: 0.025"
        material="color: white; shader: flat"
        gaze-in-vr
        animation__fusing="property: scale; startEvents: fusing; easing: easeInCubic; dur: 1500; from: 1 1 1; to: 0.1 0.1 0.1"
        animation__leave="property: scale; startEvents: mouseleave; easing: easeInCubic; dur: 300; to: 1 1 1">
      </a-entity>
    </a-camera>

  </a-scene>
</body>
</html>
```

### 6.2 Explanation of the parts

**`<head>`**

- The first `<script src=...>` loads A-Frame (with Three.js inside). Our own `<script>` must come *after* it because it uses `AFRAME`.
- `setGlow` shows the Three.js connection: `el.object3D` is the Three.js object behind an entity, and `traverse` visits all its meshes. It works for primitives and for imported `.glb` models.
- `AFRAME.registerComponent('name', { schema, init })` is the equivalent of writing a Unity script. `schema` is like public inspector fields; `init` is like `Start()`.
- **`selectable`** listens for `click`, stores the chosen entity in `scene.selected`, and highlights it. Clicking the same object again deselects it.
- **`control-button`** reads its `action` from the HTML attribute and changes the selected object's `position`, `rotation` or `scale` through `object3D`.
- **`gaze-in-vr`** enables gaze clicking (`fuse`) only inside VR, where there is no mouse or touch. This avoids accidental double clicks on desktop.

**`<a-scene>`** creates the Three.js scene, the renderer, the VR button and the render loop. Everything inside it is a 3D object.

**`<a-assets>`** preloads files so that the scene waits for them. The two optional files (sky image, 3D model) go here.

**Environment**

- `a-sky color` is the built-in sky. The two `light` entities are ambient (fills everything) and directional (like the sun).
- `a-plane` with `rotation="-90 0 0"` lies flat as a floor. Position is `x y z`: **y is up, -z is forward**.

**Objects**

- `class="clickable"` tells the raycaster which objects it may hit; `selectable="label: ..."` attaches our component with a parameter.
- The octahedron's `animation` attribute is built in, so spinning needs no code.

**Control panel**

- A parent entity, so child buttons use positions relative to the panel (like a child GameObject in Unity). It is tilted 35° toward the user.
- The `text` component draws each label. A-Frame fetches its default font online, so text will not show offline.

**Camera and cursor**

- `a-camera` gives look-controls (drag, or head movement in VR) and WASD movement. The cursor ring is a child of the camera so it is always in the centre of the view.
- `raycaster="objects: .clickable"` shoots an invisible ray from the cursor. `cursor` turns hits into `click`, `mouseenter` and `mouseleave` events. The `animation__...` lines shrink the ring while gaze-fusing.

### 6.3 The two replace points (biomedical content)

- **Sky image:** put an equirectangular `.jpg` (2:1 ratio, for example 4096×2048, ideally under 2–3 MB) at `assets/images/panorama.jpg`, uncomment 1A and 1B, and delete the plain `a-sky`. If the image looks rotated, change `rotation="0 -90 0"`. Sources: Poly Haven (download the JPG version), or an AI-generated panorama.
- **3D model:** put a `.glb` (under about 5 MB) at `assets/models/organ.glb`, uncomment 2A and 2B, and delete the red sphere. Adjust `scale`; the BIG and SMALL buttons help you find the right value. Sources: Khronos glTF sample assets, Sketchfab (downloadable, CC license), Poly Pizza.

### 6.4 How to test

1. Go Live, aim the centre ring at an object and **click**. It glows yellow and the status text updates.
2. Aim at a panel button and click. The selected object moves, rotates or scales.
3. Click the object again to deselect.
4. In Chrome with the Immersive Web Emulator, press the VR button and hold the ring over an object for 1.5 s. Gaze selection works with no click.

---

## 7. Part B – Markerless AR scene: `index2.html`

A simple AR lab: the user scans the floor or a table with the phone, a reticle appears on the detected surface, and tapping places a virtual object there. HTML buttons on screen rotate and scale it. **Markerless** means no printed marker or image is needed: the phone's AR system (ARCore) tracks surfaces by itself, and the WebXR *hit-test* feature reports where a ray from the screen meets a surface.

### 7.1 Full code

Create `index2.html` next to `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Exe 0 - Markerless AR Lab</title>

  <script src="libs/aframe-v1.7.1.min.js"></script>

  <style>
    /* The HTML layer drawn on top of the camera view in AR (DOM overlay) */
    #overlay {
      position: fixed; inset: 0;
      pointer-events: none;            /* empty areas let taps through to the AR scene */
      font-family: sans-serif;
    }
    #info {
      position: absolute; top: 12px; left: 12px; right: 12px;
      padding: 8px 12px; border-radius: 8px;
      background: rgba(0, 0, 0, 0.6); color: #fff; font-size: 14px;
    }
    #controls {
      position: absolute; left: 12px; bottom: 12px;
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
    }
    #controls button {
      pointer-events: auto;            /* buttons DO receive taps */
      padding: 12px 16px; font-size: 16px;
      border: none; border-radius: 8px;
      background: #3a86ff; color: #fff;
    }
  </style>
</head>

<body>
  <!-- ================= HTML OVERLAY (2D UI) ================= -->
  <div id="overlay">
    <div id="info">Checking AR support...</div>
    <div id="controls">
      <button id="btn-rotate">Rotate</button>
      <button id="btn-reset">Reset</button>
      <button id="btn-bigger">Bigger</button>
      <button id="btn-smaller">Smaller</button>
    </div>
  </div>

  <!-- ================= 3D SCENE ================= -->
  <a-scene
    webxr="optionalFeatures: hit-test, dom-overlay; overlayElement: #overlay;"
    ar-hit-test="target: #model">

    <!-- Desktop-preview environment: hidden automatically in AR,
         so the real room (camera image) shows through -->
    <a-sky color="#0d1b2a" hide-on-enter-ar></a-sky>
    <a-plane rotation="-90 0 0" width="10" height="10" color="#1b263b" hide-on-enter-ar></a-plane>

    <!-- Lights (AR objects still need light to look 3D) -->
    <a-entity light="type: ambient; intensity: 0.7"></a-entity>
    <a-entity light="type: directional; intensity: 0.9" position="1 4 2"></a-entity>

    <!-- The object placed in the real world.
         "model" is moved by ar-hit-test; "inner" is rotated/scaled by our buttons -->
    <a-entity id="model" position="0 0 -1.5" hide-on-enter-ar>
      <a-entity id="inner">

        <!-- Built-in placeholder: platform + organ sphere + pointer cone -->
        <a-cylinder position="0 0.01 0" radius="0.18" height="0.02" color="#2f3e46"></a-cylinder>
        <a-sphere position="0 0.14 0" radius="0.12" color="#e63946"></a-sphere>
        <a-cone position="0.18 0.14 0" rotation="0 0 -90"
                radius-bottom="0.04" radius-top="0" height="0.12" color="#ffd166"></a-cone>

        <!-- ★ REPLACE POINT (3D model): delete the three shapes above and uncomment this.
             Also uncomment the a-assets block below.
             AR works in REAL METRES: 1 unit = 1 m. Slicer exports are often in millimetres,
             so try scale="0.001" first, then adjust. -->
        <!--
        <a-entity gltf-model="#organModel" scale="0.001 0.001 0.001"></a-entity>
        -->

      </a-entity>
    </a-entity>

    <!-- ★ REPLACE POINT (assets block for the model) -->
    <!--
    <a-assets timeout="30000">
      <a-asset-item id="organModel" src="assets/models/organ.glb"></a-asset-item>
    </a-assets>
    -->

  </a-scene>

  <script>
    const scene = document.querySelector('a-scene');
    const info  = document.querySelector('#info');
    const inner = document.querySelector('#inner');

    // ---------- 1) Feature detection: does this browser support AR? ----------
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        info.textContent = supported
          ? 'AR is supported. Tap the AR button (bottom-right) to start.'
          : 'AR is NOT supported here. You see a desktop preview only.';
      });
    } else {
      info.textContent = 'WebXR is not available (needs HTTPS and a supported browser). Desktop preview only.';
    }

    // ---------- 2) Messages from the ar-hit-test component ----------
    scene.addEventListener('ar-hit-test-start', () => {
      info.textContent = 'Scanning: move your phone slowly over the floor or a table...';
    });
    scene.addEventListener('ar-hit-test-achieved', () => {
      info.textContent = 'Surface found: tap the screen to place the object.';
    });
    scene.addEventListener('ar-hit-test-select', () => {
      info.textContent = 'Placed! Use the buttons, or tap another spot to move it.';
    });

    // ---------- 3) Buttons ----------
    function addButton(selector, handler) {
      const button = document.querySelector(selector);
      // Stop a button tap from also being treated as "place the object here"
      button.addEventListener('beforexrselect', (e) => e.preventDefault());
      button.addEventListener('click', handler);
    }

    function changeScale(factor) {
      const newScale = inner.object3D.scale.x * factor;
      if (newScale > 0.2 && newScale < 5) inner.object3D.scale.multiplyScalar(factor);
    }

    addButton('#btn-rotate',  () => { inner.object3D.rotation.y += AFRAME.THREE.MathUtils.degToRad(30); });
    addButton('#btn-bigger',  () => changeScale(1.2));
    addButton('#btn-smaller', () => changeScale(1 / 1.2));
    addButton('#btn-reset',   () => {
      inner.object3D.rotation.set(0, 0, 0);
      inner.object3D.scale.set(1, 1, 1);
    });
  </script>
</body>
</html>
```

### 7.2 Explanation of the parts

**Overlay `<div id="overlay">` and its CSS (the 2D interface)**

- In AR the whole screen is the camera image. Instead of 3D buttons, this scene uses normal HTML on top of it. This is called a **DOM overlay**; it is the web equivalent of a Unity Canvas.
- `pointer-events: none` on the root lets taps on empty areas reach the AR scene (for placing). `pointer-events: auto` on the buttons makes only them tappable.
- The status bar is at the top and the buttons at the bottom-left, so that they do not cover the AR button A-Frame draws at the bottom-right.

**`<a-scene webxr="..." ar-hit-test="...">`**

- `webxr="optionalFeatures: hit-test, dom-overlay; overlayElement: #overlay"` configures the AR session. You must *request* `hit-test`; the browser only gives features you ask for. `dom-overlay` with `overlayElement` selects which HTML element is shown on top of the camera view (supported on Chrome for Android).
- `ar-hit-test="target: #model"` is the markerless registration. On the scene element, the component casts a ray from the screen into the phone's understanding of the world, draws a reticle on the surface found, and when the user taps, moves the target there. It also makes the target visible, so the object appears only after the first placement. Events fired: `ar-hit-test-start`, `ar-hit-test-achieved`, `ar-hit-test-select`.

**`hide-on-enter-ar`** is used on the sky, floor and model. On the laptop you see the full preview scene. When AR starts they are hidden so the real room shows through (a sky would cover the camera image).

**Model hierarchy (`#model` and `#inner`)**

- `#model` is the parent that `ar-hit-test` moves. `#inner` is the child that our buttons rotate and scale. Placement can overwrite the parent's transform, so putting user changes on the child keeps them when the object is re-placed.
- The cone makes rotation visible, since a sphere looks identical from every angle.

**Lights:** AR objects still need an ambient and a directional light to look 3D.

**The script**

1. **Feature detection:** `navigator.xr.isSessionSupported('immersive-ar')` asks if the browser can do AR. If `navigator.xr` does not exist (for example on plain `http` on the phone), the page says so. This message is the first diagnostic on a phone.
2. **Events:** the three `ar-hit-test-*` events guide the user: scanning, surface found, placed.
3. **Buttons:** each handler changes `inner.object3D` directly. `beforexrselect` with `preventDefault()` stops a button tap from also counting as a "place here" tap.

### 7.3 The replace point

- Uncomment the `a-assets` block and the `gltf-model` entity, and delete the three placeholder shapes.
- In AR, **1 unit = 1 real metre**. Models exported from 3D Slicer are often in millimetres, so a 150 mm organ would be 150 m tall. Start with `scale="0.001"` and adjust. This is a useful lesson for Exercise 1.

### 7.4 Requirements for AR on the phone

- Android phone with **Chrome** and Google Play Services for AR (ARCore)
- Page served over **HTTPS** (Sections 10 and 11)
- Camera permission granted
- Good lighting and a textured surface (a plain white table is hard to track)

---

## 8. Testing on the laptop

1. **Plain Chrome / Firefox:** open `index.html` and `index2.html` through Go Live. The AR page shows the preview scene and a message that AR is not supported.
2. **Chrome with the Immersive Web Emulator:** press F12 → *Immersive Web Emulator* tab. On `index.html` the VR button works and gaze selection can be tested. On `index2.html` the message should change to "AR is supported", the AR button appears, and the emulator provides a simulated room, so you can test the reticle and placement. If the emulator and a real phone disagree, trust the phone.
3. **Console:** keep `F12 → Console` open; most mistakes (wrong file path, typos in attributes) are reported there.
4. **Inspector:** `Ctrl + Alt + I` to check positions and scales.

---

## 9. Sharing 1 – Local network over HTTP

Use this to check that the scene renders on the phone. **WebXR and AR will not work over plain HTTP**, but the page loads and the phone shows the 3D scene with touch look-around.

### 9.1 Steps

1. Connect the laptop and the phone to the **same Wi-Fi network** (or connect the laptop to the phone's hotspot).
2. In VS Code click **Go Live**. Note the port (usually `5500`) in the status bar.
3. Find the laptop's local IP address:
   - **Windows:** open Command Prompt → `ipconfig` → "IPv4 Address", for example `192.168.1.23`
   - **Linux:** `hostname -I` or `ip a`
   - **macOS:** System Settings → Network, or `ipconfig getifaddr en0`
4. On the phone, open Chrome and type: `http://192.168.1.23:5500/index.html` (use your IP; `index2.html` for the AR page).
5. You should see the scene. Drag to look around.

### 9.2 If the phone cannot open the page

- **Firewall:** allow the port. Windows: accept the Defender Firewall prompt for VS Code/Node, or add an inbound rule for port 5500. Linux (ufw): `sudo ufw allow 5500/tcp`.
- **Wi-Fi isolation:** many university and public networks block devices from talking to each other ("client isolation"). Use the phone's hotspot instead.
- **VPN:** turn the VPN off on the laptop while testing, or the local IP may be unreachable.
- **Wrong IP:** a laptop with several adapters (VPN, virtual machines) may show several IPs; use the one on the Wi-Fi adapter.
- If needed, set `"liveServer.settings.host": "0.0.0.0"` in VS Code settings, then restart Live Server.

### 9.3 What to expect

| Page | Over HTTP on the phone |
|---|---|
| `index.html` (VR scene) | Renders; touch look-around works; the VR/stereo button will not work |
| `index2.html` (AR) | Renders the preview; the message says WebXR is not available |

---

## 10. Sharing 2 – HTTPS with ngrok

ngrok creates a **temporary public HTTPS URL** that forwards to a port on your laptop. This gives the phone a secure context so that the VR button (stereo mode) and AR work.

### 10.1 One-time setup

1. Create a free account at **ngrok.com** and log in to the dashboard.
2. Install the ngrok agent (see the download page for your platform):
   - **Windows:** `choco install ngrok` (Chocolatey), or download the ZIP from ngrok.com/download and run `ngrok.exe` from its folder
   - **macOS:** `brew install ngrok`
   - **Linux (Debian/Ubuntu):** `sudo apt update && sudo apt install ngrok` after adding ngrok's package repository from the download page; or download the `.tgz` and unpack it
3. Copy your **authtoken** from the dashboard and register it once:
   ```
   ngrok config add-authtoken <YOUR_TOKEN>
   ```
4. Check the install: `ngrok help`.

### 10.2 Every time you test

1. In VS Code click **Go Live** (note the port, for example 5500).
2. Open a terminal and run:
   ```
   ngrok http 5500
   ```
3. ngrok prints a line like:
   ```
   Forwarding   https://xxxx-xx-xx.ngrok-free.dev -> http://localhost:5500
   ```
   (the exact domain name differs per account and version).
4. On the phone open: `https://xxxx-xx-xx.ngrok-free.dev/index.html` or `/index2.html`.
5. On the free plan ngrok shows a **warning/interstitial page** the first time. Tap **Visit Site**.
6. Test:
   - **`index.html`:** tap the VR (goggles) button in Chrome Android, and choose stereoscopic view for a VR box headset. Use gaze selection.
   - **`index2.html`:** the message should read "AR is supported". Tap the AR button, allow the camera, move the phone slowly over a floor or table, tap when the reticle appears.

### 10.3 Useful details

- The free URL **changes every time you restart ngrok**. A static domain can be created in the dashboard (check what your plan allows) and used with `ngrok http 5500 --url your-domain.ngrok-free.app`.
- `http://127.0.0.1:4040` shows ngrok's local inspector (requests, errors).
- Keep both Live Server and the ngrok terminal running during the test; closing either one breaks the link.
- Free plans have connection limits; for a whole class, each student should run their own tunnel.
- **Do not share your authtoken** and do not leave the tunnel running unattended.
- If ngrok does not work or is blocked in your region, use GitHub Pages (Section 11), or a free alternative such as a Cloudflare quick tunnel (`cloudflared tunnel --url http://localhost:5500`); check the provider's current instructions.

---

## 11. Sharing 3 – HTTPS with GitHub Pages

GitHub Pages hosts your static files for free on a **permanent HTTPS address**. It is the best option for the final version and for submitting work, since it needs no laptop to stay on.

### 11.1 Prepare the repository

1. Create a GitHub account at github.com.
2. Click **New repository**. Name it, for example, `exe0-aframe`. Choose **Public** (Pages on free accounts needs a public repository).
3. Make sure your project has `index.html` at the **root** of the repository, with `libs/` and `assets/` next to it. Reference everything with **relative paths** (`libs/aframe-v1.7.1.min.js`, `assets/models/organ.glb`).

### 11.2 Upload the files (choose one way)

**Option A – Web upload (simplest)**

1. In the new repository click **Add file → Upload files**.
2. Drag the *contents* of your project folder (`index.html`, `index2.html`, `libs`, `assets`). Dragging folders keeps their structure.
3. Click **Commit changes**.

**Option B – Git command line**

```
cd exe0-aframe
git init
git add .
git commit -m "Exe 0 A-Frame project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/exe0-aframe.git
git push -u origin main
```

GitHub does not accept your account password for pushes; use a personal access token, SSH keys or GitHub Desktop.

### 11.3 Turn on Pages

1. In the repository open **Settings → Pages**.
2. Under **Build and deployment → Source** choose **Deploy from a branch**.
3. Select branch **main** and folder **/ (root)**, then **Save**.
4. Wait 1–2 minutes. The page then shows your address:
   ```
   https://YOUR_USERNAME.github.io/exe0-aframe/
   ```

### 11.4 Test

- VR scene: `https://YOUR_USERNAME.github.io/exe0-aframe/` (the `index.html`)
- AR scene: `https://YOUR_USERNAME.github.io/exe0-aframe/index2.html`
- Open them in Chrome on the Android phone, as in Section 10.2.

### 11.5 Updating

Upload or push the changed files again, wait about a minute, and reload. If you still see the old version, clear the cache or open the page in a private tab.

### 11.6 Common problems

- **404 page:** the file is not at the repository root, or Pages is not enabled yet.
- **Model or image does not load:** **file names are case-sensitive on GitHub** (`Organ.glb` is not `organ.glb`) and they must not contain spaces.
- **Blank scene:** check the console for a failed A-Frame script path.
- **Large files:** keep individual files below GitHub's size limits (single files over 100 MB are rejected; keep models far smaller anyway for mobile).
- **Public repository:** do not put anything private in it.

---

## 12. Optional: Chrome USB port-forwarding trick

Chrome treats `localhost` as a secure context. With USB debugging you can make the phone's `localhost` point to the laptop's server, so WebXR works without ngrok or GitHub.

1. On the Android phone enable **Developer options → USB debugging**, and connect it with a USB cable.
2. On the laptop open Chrome and go to `chrome://inspect/#devices`. Accept the debugging prompt on the phone.
3. Click **Port forwarding…**, add `5500` → `localhost:5500`, and tick **Enable port forwarding**.
4. In Chrome on the phone open `http://localhost:5500/index2.html`.

This also lets you see the phone's console from the laptop (click **inspect** next to the page). It requires a cable and USB debugging, so it is best for the teacher or advanced students.

---

## 13. Which sharing method should I use?

| Goal | Method | HTTPS? | XR works? | Link lifetime |
|---|---|---|---|---|
| Quick check that the scene renders on a phone | Local HTTP (Section 9) | No | No | While Live Server runs |
| Test VR stereo and AR on your own phone while developing | ngrok (Section 10) | Yes | Yes | Until you stop ngrok (free URL changes) |
| Final version, submission, class demo | GitHub Pages (Section 11) | Yes | Yes | Permanent |
| Cable-based development on one phone | Port forwarding (Section 12) | Yes (localhost) | Yes | While connected |

**Recommended workflow:** develop with Live Server on the laptop → check on the phone over HTTP → test XR with ngrok → publish the final version on GitHub Pages.

---

## 14. Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| Blank page; console says `AFRAME` is not defined | Wrong script path or file name; check `libs/aframe-v1.7.1.min.js` |
| "Go Live" button missing | Live Server extension not installed, or no folder opened |
| Text does not appear | The default font is loaded from the internet; check the connection |
| Model does not appear | Wrong path, wrong scale (try 0.001 or 100), file blocked on `file://`, or case/space in file name |
| Sky image looks wrong | Not a 2:1 equirectangular image, or adjust `rotation` on `a-sky` |
| Clicking does nothing | Missing `class="clickable"` or the `raycaster objects` selector does not match |
| Click works twice | Both mouse and gaze fuse active; use the `gaze-in-vr` component |
| No VR button on desktop | Normal when no headset is detected; use the Immersive Web Emulator |
| No VR/AR button on the phone | Page is on HTTP (use HTTPS), or the browser is not Chrome on Android |
| "WebXR is not available" message on the phone | Not HTTPS, or an unsupported browser |
| AR starts but the reticle never appears | Move the phone slowly, use a textured surface and better light; check ARCore is installed and updated |
| Buttons tap but object also jumps | `beforexrselect` handler missing |
| Object is huge or invisible in AR | Units are metres; scale down (for example 0.001 for millimetre models) |
| Phone cannot reach the laptop (HTTP) | Same network? Firewall? Client isolation? Use the phone hotspot |
| ngrok shows an error page | Authtoken not set, wrong port, or Live Server not running |
| GitHub Pages 404 | Pages not enabled, wrong branch/folder, or file not in the repository root |
| Works on Chrome but not Firefox (phone) | Expected: Firefox on Android has no usable WebXR mode |

---

## 15. Suggested student tasks and deliverables

**Task A – VR scene (about 1 week)**

1. Set up the environment and pass the sanity test.
2. Build the mini lab (`index.html`), then change colours, add one new shape and make it selectable.
3. Replace the sky with an equirectangular image and one object with a `.glb` model (a biomedical model if possible).
4. Add a **Reset** action to the control panel.

**Task B – Share and test (a few days)**

1. Open the page on the phone over local HTTP.
2. Run ngrok and open the HTTPS link; try the stereoscopic VR mode.
3. Publish on GitHub Pages and submit the link.

**Task C – Markerless AR (a few days)**

1. Build `index2.html`, test on the laptop with the emulator.
2. Test on an Android phone over HTTPS: place the object on a floor and a table.
3. Replace the placeholder with a small `.glb` and find the correct scale.

**Deliverables:** GitHub Pages links for `index.html` and `index2.html`, a short screen recording or screenshots from the phone, and a half-page answering: *How do web-based and Unity-based XR differ in setup, sharing and capabilities?*

**Possible extension (marker-based comparison):** AR.js with a printed marker also works in the browser and even on iOS. It can be offered as a bonus to compare marker-based and markerless registration, mirroring the Unity exercise. Pin versions carefully, since AR.js and A-Frame versions must be compatible.

---

## 16. Links to the official documentation

- A-Frame docs: https://aframe.io/docs/
- A-Frame `ar-hit-test` component: https://aframe.io/docs/1.7.0/components/ar-hit-test.html
- A-Frame `webxr` system: https://aframe.io/docs/1.7.0/components/webxr.html
- A-Frame `cursor` / `raycaster` components: https://aframe.io/docs/1.7.0/components/cursor.html
- A-Frame writing a component: https://aframe.io/docs/1.7.0/introduction/writing-a-component.html
- Three.js docs: https://threejs.org/docs/
- WebXR Device API (MDN): https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API
- WebXR specification (W3C): https://www.w3.org/TR/webxr/
- WebXR Hit Test module: https://immersive-web.github.io/hit-test/
- WebXR DOM Overlays module: https://immersive-web.github.io/dom-overlays/
- ngrok getting started: https://ngrok.com/docs/getting-started
- GitHub Pages: https://docs.github.com/en/pages
- Chrome remote debugging: https://developer.chrome.com/docs/devtools/remote-debugging
- Google ARCore supported devices: https://developers.google.com/ar/devices

> **Note:** Version numbers, menu names and free-plan limits on ngrok and GitHub change over time. Before handing this guide to students, quickly re-check Sections 10 and 11 against the current official pages, and test the whole chain once on a real Android phone.
