import * as THREE from 'three';
import Camera from './Camera';
import Player from './Player';
import { WIDTH, HEIGHT } from './constants';


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
		const root = document.body.querySelector('.main');
		this.camera = new Camera();
		this.scene = new THREE.Scene();
		this.player = new Player();
		
		const geometry = new THREE.BoxGeometry(2, 0.1, 2);
		const material = new THREE.MeshNormalMaterial();
		const place = new THREE.Mesh(geometry, material);

		place.position.y = 0;
		this.player.obj.position.y = place.position.y + 0.5;

		this.scene.add(place);
		this.scene.add(this.player.obj);

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(WIDTH, HEIGHT);

		root && root.appendChild(this.renderer.domElement);
	}

	initListeners() {
		window.addEventListener('keydown', e => {
			this.pressedKeys.add(e.key);

			if (
				!(
					this.pressedKeys.has('F5')
					|| this.pressedKeys.has('Control') && this.pressedKeys.has('r')
					|| this.pressedKeys.has('Meta') && this.pressedKeys.has('r')
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
