import * as THREE from 'three';

export interface PlayerProps {
	x: number;
	y: number;
	z: number;
}

export default class Player {
	obj: THREE.Mesh;

	constructor({x, y, z}: PlayerProps) {
		const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.1);
		const material = new THREE.MeshNormalMaterial();

		this.obj = new THREE.Mesh(geometry, material);
		this.obj.position.x = x;
		this.obj.position.y = y;
		this.obj.position.z = z;
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

