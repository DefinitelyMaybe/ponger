<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { Vector3 } from 'three';

	const { camera } = useThrelte();

	let playerDirection = new Vector3();

	let playerOnFloor = false;

	const keyStates = {};

	// useTask((delta) => {
	// 	controls(delta);
	// 	teleportPlayerIfOob();
	// });

	function getForwardVector() {
		camera.current.getWorldDirection(playerDirection);
		playerDirection.y = 0;
		playerDirection.normalize();
		return playerDirection;
	}

	function getSideVector() {
		camera.current.getWorldDirection(playerDirection);
		playerDirection.y = 0;
		playerDirection.normalize();
		playerDirection.cross(camera.current.up);

		return playerDirection;
	}

	function controls(deltaTime: number) {
		// gives a bit of air control
		const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);

		if (keyStates['KeyW']) {
			console.log('forward');
			const x = getForwardVector().multiplyScalar(speedDelta);
			// playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
		}

		if (keyStates['KeyS']) {
			// playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta));
		}

		if (keyStates['KeyA']) {
			// playerVelocity.add(getSideVector().multiplyScalar(-speedDelta));
		}

		if (keyStates['KeyD']) {
			// playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
		}

		if (playerOnFloor) {
			if (keyStates['Space']) {
				// playerVelocity.y = 15;
			}
		}
	}

	function teleportPlayerIfOob() {
		if (camera.current.position.y <= -25) {
			playerCollider.start.set(0, 0.35, 0);
			playerCollider.end.set(0, 1, 0);
			playerCollider.radius = 0.35;
			camera.current.position.copy(playerCollider.end);
			camera.current.rotation.set(0, 0, 0);
		}
	}
</script>

<svelte:body
	on:pointerdown={() => {
		if (document.pointerLockElement == null) {
			// document.body.requestPointerLock();
		}
	}}
	on:pointerup={() => {
		if (document.pointerLockElement !== null) {
			//throwBall();
		}
	}}
	on:pointermove={(event) => {
		// if (document.pointerLockElement === document.body) {
		// 	camera.current.rotation.y -= event.movementX / 500;
		// 	camera.current.rotation.x -= event.movementY / 500;
		// }
	}}
	on:keyup={(event) => {
		keyStates[event.code] = false;
	}}
	on:keydown={(event) => {
		keyStates[event.code] = true;
	}}
/>

<T.Group {...$$restProps}>
	<T.Mesh>
		<T.CapsuleGeometry />
		<T.MeshStandardMaterial color="black" />
	</T.Mesh>
</T.Group>
