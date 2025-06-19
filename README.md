# 3D Solar System
![Image](https://github.com/user-attachments/assets/30c00094-64b2-46eb-8d33-c76d19646f85)
This project is an interactive 3D visualization of the Solar System built using [Three.js](https://threejs.org/). It allows users to explore the planets orbiting the Sun, control their orbital speeds, and focus the camera on individual planets. The simulation is rendered in real-time in the browser.

## Features

- **Realistic 3D Solar System**: The Sun and all 8 major planets are represented with accurate relative sizes and orbital distances (not to scale for the real solar system, but visually distinct).
- **Animated Orbits**: Each planet orbits the Sun at a different speed, and rotates on its own axis.
- **Interactive Controls**:
  - Adjust the orbital speed of each planet using sliders.
  - Pause and resume the entire simulation.
  - Reset the camera to the default view.
  - Click on a planet's name to smoothly focus the camera on that planet.
- **Visual Effects**:
  - Starfield background for a space-like effect.
  - Saturn's rings are visually represented.
  - Orbit rings for each planet.
  - Tooltips show the planet's name when you hover over a planet.
- **Responsive Design**: The simulation resizes automatically to fit your browser window.

## How It Works

- The project uses Three.js to create a 3D scene with a camera, lighting, and objects for the Sun and planets.
- Each planet is represented as a sphere with a unique color, size, and distance from the Sun.
- Planets are grouped in orbit objects, which are rotated to simulate revolution around the Sun. Each planet also rotates on its own axis.
- The control panel (top left) lets you adjust the speed of each planet's orbit, pause/resume the simulation, and reset the camera view.
- Clicking a planet's name animates the camera to focus on that planet.
- Hovering over a planet shows a tooltip with its name.
- The simulation is rendered in a `<canvas>` element using WebGL.

## Getting Started

1. **Clone or Download** this repository to your computer.
2. **Open `index.html`** in your web browser. No server is required; it works as a static site.
3. **Interact** with the controls to explore the solar system!

## File Structure

- `index.html` – Main HTML file, loads Three.js and the project scripts.
- `style.css` – Styles for layout, controls, and dark background.
- `script.js` – Main JavaScript file containing all 3D logic, animation, and interactivity.

## Dependencies

- [Three.js](https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js) (loaded via CDN)

## Screenshots

_Add a screenshot here if you like!_

## License

This project is for educational and demonstration purposes. 
