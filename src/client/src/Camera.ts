import * as THREE from 'three';
import { WIDTH, HEIGHT } from './constants';


export default class Camera {
	obj: THREE.PerspectiveCamera;

	constructor() {
		this.obj = new THREE.PerspectiveCamera(100, WIDTH / HEIGHT, 0.01, 10);
		this.obj.position.y = 0.9;
		this.obj.position.z = 1.9;
		this.updatePositionZ = this.updatePositionZ.bind(this);
	}

	updatePositionZ(deltaY: any) {
		const delta = (deltaY/Math.abs(deltaY)) / 10;

		console.log(deltaY);

		this.obj.position.z += delta;
	}
}


