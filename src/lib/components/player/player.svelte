<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import * as THREE from 'three';
	import PlayerControls from './controls.svelte';

	const { camera } = useThrelte();

	let mesh: THREE.Mesh;

	let playerIsOnGround = false;

	let playerVelocity = new THREE.Vector3();
	let upVector = new THREE.Vector3(0, 1, 0);
	let tempVector = new THREE.Vector3();
	let tempVector2 = new THREE.Vector3();
	let tempBox = new THREE.Box3();
	let tempMat = new THREE.Matrix4();
	let tempSegment = new THREE.Line3();

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

	function updatePlayer(delta) {
		if (playerIsOnGround) {
			playerVelocity.y = delta * params.gravity;
		} else {
			playerVelocity.y += delta * params.gravity;
		}

		player.position.addScaledVector(playerVelocity, delta);

		// move the player
		const angle = controls.getAzimuthalAngle();
		if (fwdPressed) {
			tempVector.set(0, 0, -1).applyAxisAngle(upVector, angle);
			player.position.addScaledVector(tempVector, params.playerSpeed * delta);
		}

		if (bkdPressed) {
			tempVector.set(0, 0, 1).applyAxisAngle(upVector, angle);
			player.position.addScaledVector(tempVector, params.playerSpeed * delta);
		}

		if (lftPressed) {
			tempVector.set(-1, 0, 0).applyAxisAngle(upVector, angle);
			player.position.addScaledVector(tempVector, params.playerSpeed * delta);
		}

		if (rgtPressed) {
			tempVector.set(1, 0, 0).applyAxisAngle(upVector, angle);
			player.position.addScaledVector(tempVector, params.playerSpeed * delta);
		}

		player.updateMatrixWorld();

		// adjust player position based on collisions
		const capsuleInfo = player.capsuleInfo;
		tempBox.makeEmpty();
		tempMat.copy(collider.matrixWorld).invert();
		tempSegment.copy(capsuleInfo.segment);

		// get the position of the capsule in the local space of the collider
		tempSegment.start.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat);
		tempSegment.end.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat);

		// get the axis aligned bounding box of the capsule
		tempBox.expandByPoint(tempSegment.start);
		tempBox.expandByPoint(tempSegment.end);

		tempBox.min.addScalar(-capsuleInfo.radius);
		tempBox.max.addScalar(capsuleInfo.radius);

		collider.geometry.boundsTree.shapecast({
			intersectsBounds: (box) => box.intersectsBox(tempBox),

			intersectsTriangle: (tri) => {
				// check if the triangle is intersecting the capsule and adjust the
				// capsule position if it is.
				const triPoint = tempVector;
				const capsulePoint = tempVector2;

				const distance = tri.closestPointToSegment(tempSegment, triPoint, capsulePoint);
				if (distance < capsuleInfo.radius) {
					const depth = capsuleInfo.radius - distance;
					const direction = capsulePoint.sub(triPoint).normalize();

					tempSegment.start.addScaledVector(direction, depth);
					tempSegment.end.addScaledVector(direction, depth);
				}
			}
		});

		// get the adjusted position of the capsule collider in world space after checking
		// triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
		// the origin of the player model.
		const newPosition = tempVector;
		newPosition.copy(tempSegment.start).applyMatrix4(collider.matrixWorld);

		// check how much the collider was moved
		const deltaVector = tempVector2;
		deltaVector.subVectors(newPosition, player.position);

		// if the player was primarily adjusted vertically we assume it's on something we should consider ground
		playerIsOnGround = deltaVector.y > Math.abs(delta * playerVelocity.y * 0.25);

		const offset = Math.max(0.0, deltaVector.length() - 1e-5);
		deltaVector.normalize().multiplyScalar(offset);

		// adjust the player model
		player.position.add(deltaVector);
		0;

		if (!playerIsOnGround) {
			deltaVector.normalize();
			playerVelocity.addScaledVector(deltaVector, -deltaVector.dot(playerVelocity));
		} else {
			playerVelocity.set(0, 0, 0);
		}

		// adjust the camera
		camera.position.sub(controls.target);
		controls.target.copy(player.position);
		camera.position.add(player.position);

		// if the player has fallen too far below the level reset their position to the start
		if (player.position.y < -25) {
			reset();
		}
	}

	function reset() {
		playerVelocity.set(0, 0, 0);
		player.position.set(15.75, -3, 30);
		camera.position.sub(controls.target);
		controls.target.copy(player.position);
		camera.position.add(player.position);
		controls.update();
	}
</script>

<PlayerControls />

<T.Mesh
	bind:ref={mesh}
	position={[2, 2, 2]}
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
