<script lang="ts">
	import { T } from '@threlte/core';
	import { AutoColliders, RigidBody } from '@threlte/rapier';
	import * as THREE from 'three';
	import PlayerControls from './controls.svelte';
	import type { Player } from '../../Entities';

	// const { camera } = useThrelte();

	const entity: Player = {
		isPlayer: true,
		health: 100,
		physics: true,
		position: new THREE.Vector3(),
		velocity: new THREE.Vector3(),
		grounded: false
	};

	// let playerIsOnGround = false;

	// let playerVelocity = new THREE.Vector3();

	// useTask((delta) => {
	//  // Basically if bounding volumes have been created then update call
	//  // updatePlayer(delta / physicsSteps);
	// 	if (collider) {
	// 		collider.visible = params.displayCollider;
	// 		visualizer.visible = params.displayBVH;
	// 		const physicsSteps = params.physicsSteps;

	// 		for (let i = 0; i < physicsSteps; i++) {
	//
	// 		}
	// 	}
	// 	controls.update();
	// });
</script>

<PlayerControls />

<RigidBody enabledRotations={[false, true, false]}>
	<AutoColliders>
		<T.Mesh castShadow {entity} position={[2, 2, 2]}>
			<T.CapsuleGeometry
				on:create={({ ref }) => {
					ref.translate(0, -0.5, 0);
				}}
			/>
			<T.MeshStandardMaterial />
		</T.Mesh>
	</AutoColliders>
</RigidBody>
