<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import * as THREE from 'three';
	import PlayerControls from './controls.svelte';
	import type { Entity } from '../../Entities';

	const { camera } = useThrelte();

	const entity: Entity = {
		health: 100,
		mesh: undefined,
		physics: true
	};

	let playerIsOnGround = false;

	let playerVelocity = new THREE.Vector3();

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

<T.Mesh
	bind:ref={entity.mesh}
	position={[2, 2, 2]}
	{entity}
	capsuleInfo={{
		radius: 0.5,
		segment: new THREE.Line3(new THREE.Vector3(), new THREE.Vector3(0, -1.0, 0.0))
	}}
>
	<T.CapsuleGeometry
		on:create={({ ref }) => {
			ref.translate(0, -0.5, 0);
		}}
	/>
	<T.MeshStandardMaterial />
</T.Mesh>
