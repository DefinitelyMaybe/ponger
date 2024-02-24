import type { PhysicsQuery } from './components/state';
import { Vector3, Box3, Matrix4, Line3 } from 'three';
// import { useThrelte } from '@threlte/core';

const gravity = 10;
let upVector = new Vector3(0, 1, 0);
let tempVector = new Vector3();
let tempVector2 = new Vector3();
let tempBox = new Box3();
let tempMat = new Matrix4();
let tempSegment = new Line3();

export function BVHPhysicsUpdate(delta: number, query: PhysicsQuery) {
	for (const { position, velocity, grounded } of query) {
		// apply the current velocity to the player
		if (grounded) {
			velocity.y = delta * gravity;
		} else {
			velocity.y += delta * gravity;
		}
		position.addScaledVector(velocity, delta);

		// // check if we hit anything
		// // adjust player position based on collisions
		// const capsuleInfo = player.capsuleInfo;
		// tempBox.makeEmpty();
		// tempMat.copy(collider.matrixWorld).invert();
		// tempSegment.copy(capsuleInfo.segment);

		// // get the position of the capsule in the local space of the collider
		// tempSegment.start.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat);
		// tempSegment.end.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat);

		// // get the axis aligned bounding box of the capsule
		// tempBox.expandByPoint(tempSegment.start);
		// tempBox.expandByPoint(tempSegment.end);

		// tempBox.min.addScalar(-capsuleInfo.radius);
		// tempBox.max.addScalar(capsuleInfo.radius);

		// collider.geometry.boundsTree.shapecast({
		// 	intersectsBounds: (box) => box.intersectsBox(tempBox),

		// 	intersectsTriangle: (tri) => {
		// 		// check if the triangle is intersecting the capsule and adjust the
		// 		// capsule position if it is.
		// 		const triPoint = tempVector;
		// 		const capsulePoint = tempVector2;

		// 		const distance = tri.closestPointToSegment(tempSegment, triPoint, capsulePoint);
		// 		if (distance < capsuleInfo.radius) {
		// 			const depth = capsuleInfo.radius - distance;
		// 			const direction = capsulePoint.sub(triPoint).normalize();

		// 			tempSegment.start.addScaledVector(direction, depth);
		// 			tempSegment.end.addScaledVector(direction, depth);
		// 		}
		// 	}
		// });

		// // get the adjusted position of the capsule collider in world space after checking
		// // triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
		// // the origin of the player model.
		// const newPosition = tempVector;
		// newPosition.copy(tempSegment.start).applyMatrix4(collider.matrixWorld);

		// // check how much the collider was moved
		// const deltaVector = tempVector2;
		// deltaVector.subVectors(newPosition, player.position);

		// // if the player was primarily adjusted vertically we assume it's on something we should consider ground
		// playerIsOnGround = deltaVector.y > Math.abs(delta * playerVelocity.y * 0.25);

		// const offset = Math.max(0.0, deltaVector.length() - 1e-5);
		// deltaVector.normalize().multiplyScalar(offset);

		// // adjust the player model
		// player.position.add(deltaVector);

		// if (!playerIsOnGround) {
		// 	deltaVector.normalize();
		// 	playerVelocity.addScaledVector(deltaVector, -deltaVector.dot(playerVelocity));
		// } else {
		// 	playerVelocity.set(0, 0, 0);
		// }

		// and finally update position
	}
}

function updatePlayer(delta) {
	// movement from the player
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

	// adjust the camera
	// camera.position.sub(controls.target);
	// controls.target.copy(player.position);
	// camera.position.add(player.position);
}
