import type * as THREE from 'three';

export type Entity = {
	position?: THREE.Vector3;
	physics?: boolean;
	health?: number;
	mesh?: THREE.Mesh;
	isPlayer?: boolean;
};

export type Player = {
	position: THREE.Vector3;
	physics: true;
	health: number;
	mesh: THREE.Mesh;
	isPlayer: boolean;
};

export type DynamicPhysicsObject = {
	physics: true;
	position: THREE.Vector3;
	velocity: THREE.Vector3;
	grounded: boolean;
};

export type StaticPhysicsObject = {
	physics: true;
	position: THREE.Vector3;
};
