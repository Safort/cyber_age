import * as THREE from 'three';

const WIDTH = window.innerWidth - 100;
const HEIGHT = window.innerHeight - 100;


class Player {
	obj: THREE.Mesh;

	constructor() {
		const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.1);
		const material = new THREE.MeshNormalMaterial();

		this.obj = new THREE.Mesh(geometry, material);
		this.updatePosition = this.updatePosition.bind(this);
	}

	updatePosition(pressedKeys: any) {
		if (pressedKeys.has('ArrowUp')) {
			this.obj.position.y += 0.09;
		}
		
		if (pressedKeys.has('ArrowDown')) {
			this.obj.position.y -= 0.09;
		}
		
		if (pressedKeys.has('ArrowLeft')) {
			this.obj.position.x -= 0.09;
		}
		
		if (pressedKeys.has('ArrowRight')) {
			this.obj.position.x += 0.09;
		}
	}
}


class Camera {
	obj: THREE.PerspectiveCamera;

	constructor() {
		this.obj = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 0.01, 10);
		this.obj.position.z = 1.7;
		this.updatePositionZ = this.updatePositionZ.bind(this);
	}

	updatePositionZ(deltaY: any) {
		const delta = (deltaY/Math.abs(deltaY)) / 10;
		
		console.log(deltaY);

		this.obj.position.z += delta;
	}
}




export default class Game {
	camera: any;
	scene: any;
	renderer: any;
	player: any;
	pressedKeys: any;

	constructor() {
		this.pressedKeys = new Set();
		this.init = this.init.bind(this);
		this.initListeners = this.initListeners.bind(this);
		this.animate = this.animate.bind(this);

		this.init();
		this.initListeners();
		this.animate();
	}

	init() {
		this.camera = new Camera();
		this.scene = new THREE.Scene();
		this.player = new Player();
		
		const geometry = new THREE.BoxGeometry(2, 0.1, 2);
		const material = new THREE.MeshNormalMaterial();

		const place = new THREE.Mesh(geometry, material);
		place.position.y = -0.5;
		place.position.z = 0;
		
		this.scene.add(place);

		this.scene.add(this.player.obj);

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(WIDTH, HEIGHT);
		document.body.querySelector('.root').appendChild(this.renderer.domElement);
	}

	initListeners() {
		window.addEventListener('keydown', e => {
			this.pressedKeys.add(e.key);

			if (
				!(
					this.pressedKeys.has('F5')
					|| this.pressedKeys.has('Control') && this.pressedKeys.has('r')
					|| this.pressedKeys.has('F12')
				)
			) {
				e.preventDefault();
			}   

			this.player.updatePosition(this.pressedKeys);
		});
		window.addEventListener('keyup', e => {
			this.pressedKeys.delete(e.key);

			e.preventDefault();

			this.player.updatePosition(this.pressedKeys);
		});
		window.addEventListener('wheel', e => {
			this.camera.updatePositionZ(e.deltaY);
		});
	}

	animate() {
		requestAnimationFrame(this.animate);
		
		this.renderer.render(this.scene, this.camera.obj);
	}
}
