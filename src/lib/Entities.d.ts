import type * as THREE from 'three';

export type Entity = {
	position: THREE.Vector3;
};

export type StaticPhysicsObject = Entity & {
	physics: true;
};

export type DynamicPhysicsObject = Entity &
	StaticPhysicsObject & {
		velocity: THREE.Vector3;
		grounded: boolean;
	};

export type Player = Entity &
	DynamicPhysicsObject & {
		health: number;
		isPlayer: true;
	};
