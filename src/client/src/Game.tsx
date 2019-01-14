import * as React from 'react';
import * as THREE from 'three';
import WS from './ws';
import Camera from './Camera';
import Player from './Player';
import { WIDTH, HEIGHT } from './constants';


export default class Game extends React.Component {
	camera?: Camera;
	scene?: THREE.Scene;
	renderer?: THREE.WebGLRenderer;
	player?: Player;
	pressedKeys: Set<string>;
	ws: WS;

	constructor(props?: any) {
		super(props);

		this.pressedKeys = new Set();
		this.init = this.init.bind(this);
		this.initListeners = this.initListeners.bind(this);
		this.animate = this.animate.bind(this);

		this.keyDownHandler = this.keyDownHandler.bind(this);
		this.keyUpHandler = this.keyUpHandler.bind(this);
		this.wheelHandler = this.wheelHandler.bind(this);

		this.onOpen = this.onOpen.bind(this);
		this.onMessage = this.onMessage.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onError = this.onError.bind(this);

		this.ws = new WS({
			onOpen: this.onOpen,
			onMessage: this.onMessage,
			onClose: this.onClose,
			onError: this.onError,
		});

		this.init();
		this.initListeners();
		this.animate();
	}

	onOpen() {
        this.ws.socket.send('/location_list');
    }

    onMessage(res: { data: string}) {
        const data = JSON.parse(res.data);
		const payload = data[1];
		const resType = payload.type;

        if (data[0] === 'response' && resType === 'location_list') {
            this.ws.socket.send(`/join_location ${payload.location_list[0]}`);
        }

		// TODO: add router for WS messages
        if (data[0] === 'response' && resType === 'joined_location') {
			this.player = new Player({
				x: payload.x,
				y: payload.y,
				z: payload.z,
			});
			this.player.obj.position.y = 0.5;
			this.scene && this.scene.add(this.player.obj);
		}

        if (data[0] === 'message' && resType === 'joined_location') {
			this.player = new Player({
				x: payload.x,
				y: payload.y,
				z: payload.z,
			});
			this.player.obj.position.y = 0.5;
			this.scene && this.scene.add(this.player.obj);
		}
    }

    onClose(res: any) {
        console.log('ON_CLOSE > ', res);
    }

    onError(res: any) {
        console.log('ON_ERROR > ', res);
    }

	init() {
		const root = document.body.querySelector('.main');
		this.camera = new Camera();
		this.scene = new THREE.Scene();

		const geometry = new THREE.BoxGeometry(2, 0.1, 2);
		const material = new THREE.MeshNormalMaterial();
		const place = new THREE.Mesh(geometry, material);

		place.position.y = 0;

		this.scene.add(place);

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(WIDTH, HEIGHT);

		root && root.appendChild(this.renderer.domElement);
	}

	initListeners() {
		window.addEventListener('keydown', this.keyDownHandler);
		window.addEventListener('keyup', this.keyUpHandler);
		window.addEventListener('wheel', this.wheelHandler);
	}

	wheelHandler(e: WheelEvent) {
		this.camera && this.camera.updatePositionZ(e.deltaY);
	}

	keyUpHandler(e: KeyboardEvent) {
		this.pressedKeys.delete(e.key);

		e.preventDefault();

		this.player && this.player.updatePosition(this.pressedKeys);
	}

	keyDownHandler(e: KeyboardEvent) {
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

		this.player && this.player.updatePosition(this.pressedKeys);
	}

	animate() {
		requestAnimationFrame(this.animate);
		
		this.renderer && this.renderer.render(this.scene as THREE.Scene, (this.camera as Camera).obj);
	}

	render() {
		return null;
	}
}
