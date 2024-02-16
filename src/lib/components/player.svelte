<script lang="ts">
	import { Capsule } from 'three/examples/jsm/math/Capsule';
	import { Vector3 } from 'three';
	import { useThrelte, useTask } from '@threlte/core';

	const { camera } = useThrelte();

	const playerCollider = new Capsule(new Vector3(0, 0.35, 0), new Vector3(0, 1, 0), 0.35);

	const playerVelocity = new Vector3();
	const playerDirection = new Vector3();

	let playerOnFloor = false;
	let mouseTime = 0;

	const keyStates = {};

	const vector1 = new Vector3();
	const vector2 = new Vector3();
	const vector3 = new Vector3();

	useTask((delta) => {
		controls(delta);
		updatePlayer(delta);
		updateSpheres(delta);
		teleportPlayerIfOob();
	});

	function throwBall() {
		const sphere = spheres[sphereIdx];

		camera.getWorldDirection(playerDirection);

		sphere.collider.center
			.copy(playerCollider.end)
			.addScaledVector(playerDirection, playerCollider.radius * 1.5);

		// throw the ball with more force if we hold the button longer, and if we move forward

		const impulse = 15 + 30 * (1 - Math.exp((mouseTime - performance.now()) * 0.001));

		sphere.velocity.copy(playerDirection).multiplyScalar(impulse);
		sphere.velocity.addScaledVector(playerVelocity, 2);

		sphereIdx = (sphereIdx + 1) % spheres.length;
	}

	function playerCollisions() {
		const result = worldOctree.capsuleIntersect(playerCollider);

		playerOnFloor = false;

		if (result) {
			playerOnFloor = result.normal.y > 0;

			if (!playerOnFloor) {
				playerVelocity.addScaledVector(result.normal, -result.normal.dot(playerVelocity));
			}

			playerCollider.translate(result.normal.multiplyScalar(result.depth));
		}
	}

	function updatePlayer(deltaTime) {
		let damping = Math.exp(-4 * deltaTime) - 1;

		if (!playerOnFloor) {
			playerVelocity.y -= GRAVITY * deltaTime;

			// small air resistance
			damping *= 0.1;
		}

		playerVelocity.addScaledVector(playerVelocity, damping);

		const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
		playerCollider.translate(deltaPosition);

		playerCollisions();

		camera.position.copy(playerCollider.end);
	}

	function playerSphereCollision(sphere) {
		const center = vector1.addVectors(playerCollider.start, playerCollider.end).multiplyScalar(0.5);

		const sphere_center = sphere.collider.center;

		const r = playerCollider.radius + sphere.collider.radius;
		const r2 = r * r;

		// approximation: player = 3 spheres

		for (const point of [playerCollider.start, playerCollider.end, center]) {
			const d2 = point.distanceToSquared(sphere_center);

			if (d2 < r2) {
				const normal = vector1.subVectors(point, sphere_center).normalize();
				const v1 = vector2.copy(normal).multiplyScalar(normal.dot(playerVelocity));
				const v2 = vector3.copy(normal).multiplyScalar(normal.dot(sphere.velocity));

				playerVelocity.add(v2).sub(v1);
				sphere.velocity.add(v1).sub(v2);

				const d = (r - Math.sqrt(d2)) / 2;
				sphere_center.addScaledVector(normal, -d);
			}
		}
	}

	function spheresCollisions() {
		for (let i = 0, length = spheres.length; i < length; i++) {
			const s1 = spheres[i];

			for (let j = i + 1; j < length; j++) {
				const s2 = spheres[j];

				const d2 = s1.collider.center.distanceToSquared(s2.collider.center);
				const r = s1.collider.radius + s2.collider.radius;
				const r2 = r * r;

				if (d2 < r2) {
					const normal = vector1.subVectors(s1.collider.center, s2.collider.center).normalize();
					const v1 = vector2.copy(normal).multiplyScalar(normal.dot(s1.velocity));
					const v2 = vector3.copy(normal).multiplyScalar(normal.dot(s2.velocity));

					s1.velocity.add(v2).sub(v1);
					s2.velocity.add(v1).sub(v2);

					const d = (r - Math.sqrt(d2)) / 2;

					s1.collider.center.addScaledVector(normal, d);
					s2.collider.center.addScaledVector(normal, -d);
				}
			}
		}
	}

	function updateSpheres(deltaTime) {
		spheres.forEach((sphere) => {
			sphere.collider.center.addScaledVector(sphere.velocity, deltaTime);

			const result = worldOctree.sphereIntersect(sphere.collider);

			if (result) {
				sphere.velocity.addScaledVector(result.normal, -result.normal.dot(sphere.velocity) * 1.5);
				sphere.collider.center.add(result.normal.multiplyScalar(result.depth));
			} else {
				sphere.velocity.y -= GRAVITY * deltaTime;
			}

			const damping = Math.exp(-1.5 * deltaTime) - 1;
			sphere.velocity.addScaledVector(sphere.velocity, damping);

			playerSphereCollision(sphere);
		});

		spheresCollisions();

		for (const sphere of spheres) {
			sphere.mesh.position.copy(sphere.collider.center);
		}
	}

	function getForwardVector() {
		camera.getWorldDirection(playerDirection);
		playerDirection.y = 0;
		playerDirection.normalize();

		return playerDirection;
	}

	function getSideVector() {
		camera.getWorldDirection(playerDirection);
		playerDirection.y = 0;
		playerDirection.normalize();
		playerDirection.cross(camera.up);

		return playerDirection;
	}

	function controls(deltaTime) {
		// gives a bit of air control
		const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);

		if (keyStates['KeyW']) {
			playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
		}

		if (keyStates['KeyS']) {
			playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta));
		}

		if (keyStates['KeyA']) {
			playerVelocity.add(getSideVector().multiplyScalar(-speedDelta));
		}

		if (keyStates['KeyD']) {
			playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
		}

		if (playerOnFloor) {
			if (keyStates['Space']) {
				playerVelocity.y = 15;
			}
		}
	}

	function teleportPlayerIfOob() {
		if (camera.position.y <= -25) {
			playerCollider.start.set(0, 0.35, 0);
			playerCollider.end.set(0, 1, 0);
			playerCollider.radius = 0.35;
			camera.position.copy(playerCollider.end);
			camera.rotation.set(0, 0, 0);
		}
	}
</script>

<svelte:body
	on:pointerdown={() => {
		document.body.requestPointerLock();
		mouseTime = performance.now();
	}}
	on:pointerup={() => {
		if (document.pointerLockElement !== null) throwBall();
	}}
	on:pointermove={(event) => {
		if (document.pointerLockElement === document.body) {
			camera.rotation.y -= event.movementX / 500;
			camera.rotation.x -= event.movementY / 500;
		}
	}}
	on:keyup={(event) => {
		keyStates[event.code] = false;
	}}
	on:keydown={(event) => {
		keyStates[event.code] = true;
	}}
/>
