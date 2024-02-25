<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	// import { useKeyboardControls } from '@react-three/drei';
	import { useTask } from '@threlte/core';
	import { RigidBody, Collider, useRapier } from '@threlte/rapier';
	import * as THREE from 'three';
	import { useFollowCam } from './hooks/useFollowCam';
	import { useGame } from './hooks/useGame';
	import { useJoystickControls } from './hooks/useJoystickControls';
	import type {
		Collider as RapierCollider,
		RayColliderToi,
		Vector
	} from '@dimforge/rapier3d-compat';

	export { EcctrlAnimation } from './EcctrlAnimation';
	export { useFollowCam } from './hooks/useFollowCam';
	export { useGame } from './stores/useGame';
	export { EcctrlJoystick } from '../src/EcctrlJoystick';
	export { useJoystickControls } from './stores/useJoystickControls';

	const { camera } = useThrelte();

	let capsuleHalfHeight = 0.35;
	let capsuleRadius = 0.3;
	let floatHeight = 0.3;
	let characterInitDir = 0; // in rad
	let followLight = false;
	let disableFollowCam = false;
	let disableFollowCamPos = { x: 0, y: 0, z: -5 };
	let disableFollowCamTarget = { x: 0, y: 0, z: 0 };
	// Follow camera setups
	let camInitDis = -5;
	let camMaxDis = -7;
	let camMinDis = -0.7;
	let camInitDir = { x: 0, y: 0, z: 0 }; // in rad
	let camTargetPos = { x: 0, y: 0, z: 0 };
	let camMoveSpeed = 1;
	let camZoomSpeed = 1;
	let camCollision = true;
	let camCollisionOffset = 0.7;
	// Follow light setups
	let followLightPos = { x: 20, y: 30, z: 10 };
	// Base control setups
	let maxVelLimit = 2.5;
	let turnVelMultiplier = 0.2;
	let turnSpeed = 15;
	let sprintMult = 2;
	let jumpVel = 4;
	let jumpForceToGroundMult = 5;
	let slopJumpMult = 0.25;
	let sprintJumpMult = 1.2;
	let airDragMultiplier = 0.2;
	let dragDampingC = 0.15;
	let accDeltaTime = 8;
	let rejectVelMult = 4;
	let moveImpulsePointY = 0.5;
	let camFollowMult = 11;
	let fallingGravityScale = 2.5;
	let fallingMaxVel = -20;
	let wakeUpDelay = 200;
	// Floating Ray setups
	let rayOriginOffest = { x: 0, y: -capsuleHalfHeight, z: 0 };
	let rayHitForgiveness = 0.1;
	let rayLength = capsuleRadius + 2;
	let rayDir = { x: 0, y: -1, z: 0 };
	let floatingDis = capsuleRadius + floatHeight;
	let springK = 1.2;
	let dampingC = 0.08;
	// Slope Ray setups
	let showSlopeRayOrigin = false;
	let slopeMaxAngle = 1; // in rad
	let slopeRayOriginOffest = capsuleRadius - 0.03;
	let slopeRayLength = capsuleRadius + 3;
	let slopeRayDir = { x: 0, y: -1, z: 0 };
	let slopeUpExtraForce = 0.1;
	let slopeDownExtraForce = 0.2;
	// AutoBalance Force setups
	let autoBalance = true;
	let autoBalanceSpringK = 0.3;
	let autoBalanceDampingC = 0.03;
	let autoBalanceSpringOnY = 0.5;
	let autoBalanceDampingOnY = 0.015;
	// Animation temporary setups
	let animated = false;
	// Mode setups
	let mode = null;
	// Controller setups
	let controllerKeys = {
		forward: 12,
		backward: 13,
		leftward: 14,
		rightward: 15,
		jump: 2,
		action1: 11,
		action2: 3,
		action3: 1,
		action4: 0
	};

	// Retrieve current moving direction of the character
	const getMovingDirection = (
		forward: boolean,
		backward: boolean,
		leftward: boolean,
		rightward: boolean,
		pivot: THREE.Object3D
	): number | undefined => {
		if (!forward && !backward && !leftward && !rightward) return undefined;
		if (forward && leftward) return pivot.rotation.y + Math.PI / 4;
		if (forward && rightward) return pivot.rotation.y - Math.PI / 4;
		if (backward && leftward) return pivot.rotation.y - Math.PI / 4 + Math.PI;
		if (backward && rightward) return pivot.rotation.y + Math.PI / 4 + Math.PI;
		if (backward) return pivot.rotation.y + Math.PI;
		if (leftward) return pivot.rotation.y + Math.PI / 2;
		if (rightward) return pivot.rotation.y - Math.PI / 2;
		if (forward) return pivot.rotation.y;
	};

	/**
	 * Point-to-move function
	 */
	const pointToMove = (delta: number, slopeAngle: number, movingObjectVelocity: THREE.Vector3) => {
		const moveToPoint = getMoveToPoint().moveToPoint;
		if (moveToPoint) {
			pointToPoint.set(moveToPoint.x - currentPos.x, 0, moveToPoint.z - currentPos.z);
			crossVector.crossVectors(pointToPoint, vectorZ);
			// Rotate character to moving direction
			modelEuler.y = (crossVector.y > 0 ? -1 : 1) * pointToPoint.angleTo(vectorZ);
			// Once character close to the target point (distance<0.3),
			// Or character close to the wall (bodySensor intersects)
			// stop moving
			if (characterRef.current) {
				if (pointToPoint.length() > 0.3 && !isBodyHitWall) {
					moveCharacter(delta, false, slopeAngle, movingObjectVelocity);
					isPointMoving = true;
				} else {
					isPointMoving = false;
				}
			}
		}
	};

	/**
	 * Mode setup
	 */
	let isModePointToMove = false;
	const setCameraBased = useGame((state) => state.setCameraBased);
	const getCameraBased = useGame((state) => state.getCameraBased);
	if (mode) {
		if (mode === 'PointToMove') isModePointToMove = true;
		if (mode === 'CameraBasedMovement') setCameraBased(true);
	}

	// const Ecctrl: (ref:RapierRigidBody, props:EcctrlProps)=> void = (
	let characterRef: RigidBody | undefined;
	let characterModelRef: THREE.Group | undefined;
	const characterModelIndicator = new THREE.Object3D();
	const defaultControllerKeys = {
		forward: 12,
		backward: 13,
		leftward: 14,
		rightward: 15,
		jump: 2,
		action1: 11,
		action2: 3,
		action3: 1,
		action4: 0
	};

	/**
	 * Body collider setup
	 */
	const modelFacingVec = new THREE.Vector3();
	const bodyFacingVec = new THREE.Vector3();
	const bodyBalanceVec = new THREE.Vector3();
	const bodyBalanceVecOnX = new THREE.Vector3();
	const bodyFacingVecOnY = new THREE.Vector3();
	const bodyBalanceVecOnZ = new THREE.Vector3();
	const vectorY = new THREE.Vector3(0, 1, 0);
	const vectorZ = new THREE.Vector3(0, 0, 1);
	const bodyContactForce = new THREE.Vector3();

	// Animation change functions
	const idleAnimation = !animated ? null : useGame((state) => state.idle);
	const walkAnimation = !animated ? null : useGame((state) => state.walk);
	const runAnimation = !animated ? null : useGame((state) => state.run);
	const jumpAnimation = !animated ? null : useGame((state) => state.jump);
	const jumpIdleAnimation = !animated ? null : useGame((state) => state.jumpIdle);
	const fallAnimation = !animated ? null : useGame((state) => state.fall);
	const action1Animation = !animated ? null : useGame((state) => state.action1);
	const action2Animation = !animated ? null : useGame((state) => state.action2);
	const action3Animation = !animated ? null : useGame((state) => state.action3);
	const action4Animation = !animated ? null : useGame((state) => state.action4);

	/**
	 * Check if inside keyboardcontrols
	 */
	function useIsInsideKeyboardControls() {
		try {
			return !!useKeyboardControls();
		} catch {
			return false;
		}
	}
	const isInsideKeyboardControls = useIsInsideKeyboardControls();

	/**
	 * keyboard controls setup
	 */
	const [subscribeKeys, getKeys] = isInsideKeyboardControls ? useKeyboardControls() : [null];
	const presetKeys = {
		forward: false,
		backward: false,
		leftward: false,
		rightward: false,
		jump: false,
		run: false
	};
	const { rapier, world } = useRapier();

	// can jump setup
	let canJump = false;
	let isFalling = false;
	const initialGravityScale: number = props.gravityScale || 1;

	// on moving object state
	let massRatio = 1;
	let isOnMovingObject = false;
	const standingForcePoint = new THREE.Vector3();
	const movingObjectDragForce = new THREE.Vector3();
	const movingObjectVelocity = new THREE.Vector3();
	const movingObjectVelocityInCharacterDir = new THREE.Vector3();
	const distanceFromCharacterToObject = new THREE.Vector3();
	const objectAngvelToLinvel = new THREE.Vector3();
	const velocityDiff = new THREE.Vector3();

	/**
	 * Follow camera initial setups from props
	 */
	const cameraSetups = {
		disableFollowCam,
		disableFollowCamPos,
		disableFollowCamTarget,
		camInitDis,
		camMaxDis,
		camMinDis,
		camMoveSpeed,
		camZoomSpeed,
		camCollisionOffset
	};

	/**
	 * Load camera pivot and character move preset
	 */
	const { pivot, cameraCollisionDetect, joystickCamMove } = useFollowCam(cameraSetups);
	const pivotPosition = new THREE.Vector3();
	const modelEuler = new THREE.Euler();
	const modelQuat = new THREE.Quaternion();
	const moveImpulse = new THREE.Vector3();
	const movingDirection = new THREE.Vector3();
	const moveAccNeeded = new THREE.Vector3();
	const jumpVelocityVec = new THREE.Vector3();
	const jumpDirection = new THREE.Vector3();
	const currentVel = new THREE.Vector3();
	const currentPos = new THREE.Vector3();
	const dragForce = new THREE.Vector3();
	const dragAngForce = new THREE.Vector3();
	const wantToMoveVel = new THREE.Vector3();
	const rejectVel = new THREE.Vector3();

	/**
	 * Floating Ray setup
	 */
	let floatingForce = null;
	const springDirVec = new THREE.Vector3();
	const characterMassForce = new THREE.Vector3();
	const rayOrigin = new THREE.Vector3();
	const rayCast = new rapier.Ray(rayOrigin, rayDir);
	let rayHit: RayColliderToi | null;

	/**
	 * Slope detection ray setup
	 */
	let slopeAngle: number = null;
	let actualSlopeNormal: Vector = null;
	let actualSlopeAngle: number = null;
	const actualSlopeNormalVec = new THREE.Vector3();
	const floorNormal = new THREE.Vector3(0, 1, 0);
	let slopeRayOriginRef: THREE.Mesh | undefined;
	const slopeRayorigin = new THREE.Vector3();
	const slopeRayCast = new rapier.Ray(slopeRayorigin, slopeRayDir);
	let slopeRayHit: RayColliderToi = null;

	/**
	 * Point to move setup
	 */
	let isBodyHitWall = false;
	let isPointMoving = false;
	const crossVector = new THREE.Vector3();
	const pointToPoint = new THREE.Vector3();
	const getMoveToPoint = useGame((state) => state.getMoveToPoint);
	let bodySensorRef: Collider | undefined;
	const handleOnIntersectionEnter = () => {
		isBodyHitWall = true;
	};
	const handleOnIntersectionExit = () => {
		isBodyHitWall = false;
	};

	/**
	 * Character moving function
	 */
	const moveCharacter = (
		_: number,
		run: boolean,
		slopeAngle: number,
		movingObjectVelocity: THREE.Vector3
	) => {
		/**
		 * Setup moving direction
		 */
		// Only apply slope extra force when slope angle is between 0.2 and slopeMaxAngle, actualSlopeAngle < slopeMaxAngle
		if (
			actualSlopeAngle < slopeMaxAngle &&
			Math.abs(slopeAngle) > 0.2 &&
			Math.abs(slopeAngle) < slopeMaxAngle
		) {
			movingDirection.set(0, Math.sin(slopeAngle), Math.cos(slopeAngle));
		} else if (actualSlopeAngle >= slopeMaxAngle) {
			movingDirection.set(
				0,
				Math.sin(slopeAngle) > 0 ? 0 : Math.sin(slopeAngle),
				Math.sin(slopeAngle) > 0 ? 0.1 : 1
			);
		} else {
			movingDirection.set(0, 0, 1);
		}

		// Apply character quaternion to moving direction
		movingDirection.applyQuaternion(characterModelIndicator.quaternion);

		/**
		 * Moving object conditions
		 */
		// Calculate moving object velocity direction according to character moving direction
		movingObjectVelocityInCharacterDir
			.copy(movingObjectVelocity)
			.projectOnVector(movingDirection)
			.multiply(movingDirection);
		// Calculate angle between moving object velocity direction and character moving direction
		const angleBetweenCharacterDirAndObjectDir = movingObjectVelocity.angleTo(movingDirection);

		/**
		 * Setup rejection velocity, (currently only work on ground)
		 */
		const wantToMoveMeg = currentVel.dot(movingDirection);
		wantToMoveVel.set(movingDirection.x * wantToMoveMeg, 0, movingDirection.z * wantToMoveMeg);
		rejectVel.copy(currentVel).sub(wantToMoveVel);

		/**
		 * Calculate required accelaration and force: a = Δv/Δt
		 * If it's on a moving/rotating platform, apply platform velocity to Δv accordingly
		 * Also, apply reject velocity when character is moving opposite of it's moving direction
		 */
		moveAccNeeded.set(
			(movingDirection.x *
				(maxVelLimit * (run ? sprintMult : 1) + movingObjectVelocityInCharacterDir.x) -
				(currentVel.x -
					movingObjectVelocity.x * Math.sin(angleBetweenCharacterDirAndObjectDir) +
					rejectVel.x * (isOnMovingObject ? 0 : rejectVelMult))) /
				accDeltaTime,
			0,
			(movingDirection.z *
				(maxVelLimit * (run ? sprintMult : 1) + movingObjectVelocityInCharacterDir.z) -
				(currentVel.z -
					movingObjectVelocity.z * Math.sin(angleBetweenCharacterDirAndObjectDir) +
					rejectVel.z * (isOnMovingObject ? 0 : rejectVelMult))) /
				accDeltaTime
		);

		// Wanted to move force function: F = ma
		const moveForceNeeded = moveAccNeeded.multiplyScalar(characterRef.current.mass());

		/**
		 * Check if character complete turned to the wanted direction
		 */
		const characterRotated =
			Math.sin(characterModelIndicator.rotation.y).toFixed(3) == Math.sin(modelEuler.y).toFixed(3);

		// If character hasn't complete turning, change the impulse quaternion follow characterModelIndicator quaternion
		if (!characterRotated) {
			moveImpulse.set(
				moveForceNeeded.x * turnVelMultiplier * (canJump ? 1 : airDragMultiplier), // if it's in the air, give it less control
				slopeAngle === null || slopeAngle == 0 // if it's on a slope, apply extra up/down force to the body
					? 0
					: movingDirection.y *
							turnVelMultiplier *
							(movingDirection.y > 0 // check it is on slope up or slope down
								? slopeUpExtraForce
								: slopeDownExtraForce) *
							(run ? sprintMult : 1),
				moveForceNeeded.z * turnVelMultiplier * (canJump ? 1 : airDragMultiplier) // if it's in the air, give it less control
			);
		}
		// If character complete turning, change the impulse quaternion default
		else {
			moveImpulse.set(
				moveForceNeeded.x * (canJump ? 1 : airDragMultiplier),
				slopeAngle === null || slopeAngle == 0 // if it's on a slope, apply extra up/down force to the body
					? 0
					: movingDirection.y *
							(movingDirection.y > 0 // check it is on slope up or slope down
								? slopeUpExtraForce
								: slopeDownExtraForce) *
							(run ? sprintMult : 1),
				moveForceNeeded.z * (canJump ? 1 : airDragMultiplier)
			);
		}

		// Move character at proper direction and impulse
		characterRef.current.applyImpulseAtPoint(
			moveImpulse,
			{
				x: currentPos.x,
				y: currentPos.y + moveImpulsePointY,
				z: currentPos.z
			},
			true
		);
	};

	/**
	 * Character auto balance function
	 */
	const autoBalanceCharacter = () => {
		// Match body component to character model rotation on Y
		bodyFacingVec.set(0, 0, 1).applyQuaternion(quat(characterRef.current.rotation()));
		bodyBalanceVec.set(0, 1, 0).applyQuaternion(quat(characterRef.current.rotation()));

		bodyBalanceVecOnX.set(0, bodyBalanceVec.y, bodyBalanceVec.z);
		bodyFacingVecOnY.set(bodyFacingVec.x, 0, bodyFacingVec.z);
		bodyBalanceVecOnZ.set(bodyBalanceVec.x, bodyBalanceVec.y, 0);

		// Check if is camera based movement
		if (getCameraBased().isCameraBased) {
			modelEuler.y = pivot.rotation.y;
			pivot.getWorldDirection(modelFacingVec);
		} else {
			characterModelIndicator.getWorldDirection(modelFacingVec);
		}
		const crossVecOnX = vectorY.clone().cross(bodyBalanceVecOnX);
		const crossVecOnY = modelFacingVec.clone().cross(bodyFacingVecOnY);
		const crossVecOnZ = vectorY.clone().cross(bodyBalanceVecOnZ);

		dragAngForce.set(
			(crossVecOnX.x < 0 ? 1 : -1) * autoBalanceSpringK * bodyBalanceVecOnX.angleTo(vectorY) -
				characterRef.current.angvel().x * autoBalanceDampingC,
			(crossVecOnY.y < 0 ? 1 : -1) *
				autoBalanceSpringOnY *
				modelFacingVec.angleTo(bodyFacingVecOnY) -
				characterRef.current.angvel().y * autoBalanceDampingOnY,
			(crossVecOnZ.z < 0 ? 1 : -1) * autoBalanceSpringK * bodyBalanceVecOnZ.angleTo(vectorY) -
				characterRef.current.angvel().z * autoBalanceDampingC
		);

		// Apply balance torque impulse
		characterRef.current.applyTorqueImpulse(dragAngForce, true);
	};

	/**
	 * Character sleep function
	 */
	const sleepCharacter = () => {
		if (characterRef.current) {
			if (document.visibilityState === 'hidden') {
				characterRef.current.sleep();
			} else {
				setTimeout(() => {
					characterRef.current.wakeUp();
				}, wakeUpDelay);
			}
		}
	};

	useEffect(() => {
		// Lock character rotations at Y axis
		characterRef.current.setEnabledRotations(
			autoBalance ? true : false,
			autoBalance ? true : false,
			autoBalance ? true : false,
			false
		);

		// Reset character quaternion
		return () => {
			if (characterRef.current && characterModelRef.current) {
				characterModelRef.current.quaternion.set(0, 0, 0, 1);
				characterRef.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, false);
			}
		};
	}, [autoBalance]);

	useEffect(() => {
		// Initialize character facing direction
		modelEuler.y = characterInitDir;
		// Initialize camera facing direction
		pivot.rotation.x = camInitDir.x;
		pivot.rotation.y = camInitDir.y;
		pivot.rotation.z = camInitDir.z;
	}, []);

	useTask((delta) => {
		// Character current position
		if (characterRef.current) {
			currentPos.copy(characterRef.current.translation() as THREE.Vector3);
			(characterRef.current.userData as userDataType).canJump = canJump;
		}

		/**
		 * Getting all gamepad control values
		 */
		if (controllerIndex !== null) {
			const gamepad = navigator.getGamepads()[controllerIndex];
			handleButtons(gamepad.buttons);
			handleSticks(gamepad.axes);
			// Getting moving directions (IIFE)
			modelEuler.y = ((movingDirection) =>
				movingDirection === null ? modelEuler.y : movingDirection)(
				getMovingDirection(
					gamepadKeys.forward,
					gamepadKeys.backward,
					gamepadKeys.leftward,
					gamepadKeys.rightward,
					pivot
				)
			);
		}

		/**
		 * Getting all joystick control values
		 */
		const { joystickDis, joystickAng, runState, button1Pressed } = getJoystickValues();

		// Move character to the moving direction (joystick controls)
		if (joystickDis > 0) {
			// Apply camera rotation to character model
			modelEuler.y = pivot.rotation.y + (joystickAng - Math.PI / 2);
			moveCharacter(delta, runState, slopeAngle, movingObjectVelocity);
		}

		/**
		 * Getting all the useful keys from useKeyboardControls
		 */
		const { forward, backward, leftward, rightward, jump, run } = isInsideKeyboardControls
			? getKeys()
			: presetKeys;

		// Getting moving directions (IIFE)
		modelEuler.y = ((movingDirection) =>
			movingDirection === null ? modelEuler.y : movingDirection)(
			getMovingDirection(forward, backward, leftward, rightward, pivot)
		);

		// Move character to the moving direction
		if (
			forward ||
			backward ||
			leftward ||
			rightward ||
			gamepadKeys.forward ||
			gamepadKeys.backward ||
			gamepadKeys.leftward ||
			gamepadKeys.rightward
		)
			moveCharacter(delta, run, slopeAngle, movingObjectVelocity);

		// Character current velocity
		if (characterRef.current) currentVel.copy(characterRef.current.linvel() as THREE.Vector3);

		// Jump impulse
		if ((jump || button1Pressed) && canJump) {
			// characterRef.current.applyImpulse(jumpDirection.set(0, 0.5, 0), true);
			jumpVelocityVec.set(currentVel.x, run ? sprintJumpMult * jumpVel : jumpVel, currentVel.z);
			// Apply slope normal to jump direction
			characterRef.current.setLinvel(
				jumpDirection
					.set(0, (run ? sprintJumpMult * jumpVel : jumpVel) * slopJumpMult, 0)
					.projectOnVector(actualSlopeNormalVec)
					.add(jumpVelocityVec),
				true
			);
			// Apply jump force downward to the standing platform
			characterMassForce.y *= jumpForceToGroundMult;
			rayHit.collider.parent()?.applyImpulseAtPoint(characterMassForce, standingForcePoint, true);
		}

		// Rotate character Indicator
		modelQuat.setFromEuler(modelEuler);
		characterModelIndicator.quaternion.rotateTowards(modelQuat, delta * turnSpeed);

		// If autobalance is off, rotate character model itself
		if (!autoBalance) {
			if (getCameraBased().isCameraBased) {
				characterModelRef.current.quaternion.copy(pivot.quaternion);
			} else {
				characterModelRef.current.quaternion.copy(characterModelIndicator.quaternion);
			}
		}

		/**
		 *  Camera movement
		 */
		pivotPosition.set(
			currentPos.x + camTargetPos.x,
			currentPos.y + (camTargetPos.y || capsuleHalfHeight + capsuleRadius / 2),
			currentPos.z + camTargetPos.z
		);
		pivot.position.lerp(pivotPosition, 1 - Math.exp(-camFollowMult * delta));
		!disableFollowCam && camera.current.lookAt(pivot.position);

		/**
		 * Ray casting detect if on ground
		 */
		rayOrigin.addVectors(currentPos, rayOriginOffest as THREE.Vector3);
		rayHit = world.castRay(
			rayCast,
			rayLength,
			true,
			null,
			null,
			// I have no idea
			characterRef.current as unknown as Collider,
			characterRef.current,
			// this exclude with sensor collider
			(collider) => !collider.isSensor()
		);

		if (rayHit && rayHit.toi < floatingDis + rayHitForgiveness) {
			if (slopeRayHit && actualSlopeAngle < slopeMaxAngle) {
				canJump = true;
			}
		} else {
			canJump = false;
		}

		/**
		 * Ray detect if on rigid body or dynamic platform, then apply the linear velocity and angular velocity to character
		 */
		if (rayHit && canJump) {
			if (rayHit.collider.parent()) {
				// Getting the standing force apply point
				standingForcePoint.set(rayOrigin.x, rayOrigin.y - rayHit.toi, rayOrigin.z);
				const rayHitObjectBodyType = rayHit.collider.parent().bodyType();
				const rayHitObjectBodyMass = rayHit.collider.parent().mass();
				massRatio = characterRef.current.mass() / rayHitObjectBodyMass;
				// Body type 0 is rigid body, body type 1 is fixed body, body type 2 is kinematic body
				if (rayHitObjectBodyType === 0 || rayHitObjectBodyType === 2) {
					isOnMovingObject = true;
					// Calculate distance between character and moving object
					distanceFromCharacterToObject
						.copy(currentPos)
						.sub(rayHit.collider.parent().translation() as THREE.Vector3);
					// Moving object linear velocity
					const movingObjectLinvel = rayHit.collider.parent().linvel() as THREE.Vector3;
					// Moving object angular velocity
					const movingObjectAngvel = rayHit.collider.parent().angvel() as THREE.Vector3;
					// Combine object linear velocity and angular velocity to movingObjectVelocity
					movingObjectVelocity
						.set(
							movingObjectLinvel.x +
								objectAngvelToLinvel.crossVectors(movingObjectAngvel, distanceFromCharacterToObject)
									.x,
							movingObjectLinvel.y,
							movingObjectLinvel.z +
								objectAngvelToLinvel.crossVectors(movingObjectAngvel, distanceFromCharacterToObject)
									.z
						)
						.multiplyScalar(Math.min(1, 1 / massRatio));
					// If the velocity diff is too high (> 30), ignore movingObjectVelocity
					velocityDiff.subVectors(movingObjectVelocity, currentVel);
					if (velocityDiff.length() > 30)
						movingObjectVelocity.multiplyScalar(1 / velocityDiff.length());

					// Apply opposite drage force to the stading rigid body, body type 0
					// Character moving and unmoving should provide different drag force to the platform
					if (rayHitObjectBodyType === 0) {
						if (
							!forward &&
							!backward &&
							!leftward &&
							!rightward &&
							canJump &&
							joystickDis === 0 &&
							!isPointMoving &&
							!gamepadKeys.forward &&
							!gamepadKeys.backward &&
							!gamepadKeys.leftward &&
							!gamepadKeys.rightward
						) {
							movingObjectDragForce
								.copy(bodyContactForce)
								.multiplyScalar(delta)
								.multiplyScalar(Math.min(1, 1 / massRatio)) // Scale up/down base on different masses ratio
								.negate();
							bodyContactForce.set(0, 0, 0);
						} else {
							movingObjectDragForce
								.copy(moveImpulse)
								.multiplyScalar(Math.min(1, 1 / massRatio)) // Scale up/down base on different masses ratio
								.negate();
						}
						rayHit.collider
							.parent()
							.applyImpulseAtPoint(movingObjectDragForce, standingForcePoint, true);
					}
				} else {
					// on fixed body
					massRatio = 1;
					isOnMovingObject = false;
					bodyContactForce.set(0, 0, 0);
					movingObjectVelocity.set(0, 0, 0);
				}
			}
		} else {
			// in the air
			massRatio = 1;
			isOnMovingObject = false;
			bodyContactForce.set(0, 0, 0);
			movingObjectVelocity.set(0, 0, 0);
		}

		/**
		 * Slope ray casting detect if on slope
		 */
		slopeRayOriginRef.current.getWorldPosition(slopeRayorigin);
		slopeRayorigin.y = rayOrigin.y;
		slopeRayHit = world.castRay(
			slopeRayCast,
			slopeRayLength,
			true,
			null,
			null,
			// Still no idea
			characterRef.current as unknown as Collider,
			characterRef.current,
			// this exclude with sensor collider
			(collider) => !collider.isSensor()
		);

		// Calculate slope angle
		if (slopeRayHit) {
			actualSlopeNormal = slopeRayHit.collider.castRayAndGetNormal(
				slopeRayCast,
				slopeRayLength,
				false
			)?.normal;
			if (actualSlopeNormal) {
				actualSlopeNormalVec?.set(actualSlopeNormal.x, actualSlopeNormal.y, actualSlopeNormal.z);
				actualSlopeAngle = actualSlopeNormalVec?.angleTo(floorNormal);
			}
		}
		if (slopeRayHit && rayHit && slopeRayHit.toi < floatingDis + 0.5) {
			if (canJump) {
				// Round the slope angle to 2 decimal places
				slopeAngle = Number(
					Math.atan((rayHit.toi - slopeRayHit.toi) / slopeRayOriginOffest).toFixed(2)
				);
			} else {
				slopeAngle = null;
			}
		} else {
			slopeAngle = null;
		}

		/**
		 * Apply floating force
		 */
		if (rayHit != null) {
			if (canJump && rayHit.collider.parent()) {
				floatingForce =
					springK * (floatingDis - rayHit.toi) - characterRef.current.linvel().y * dampingC;
				characterRef.current.applyImpulse(springDirVec.set(0, floatingForce, 0), false);

				// Apply opposite force to standing object (gravity g in rapier is 0.11 ?_?)
				characterMassForce.set(0, floatingForce > 0 ? -floatingForce : 0, 0);
				rayHit.collider.parent()?.applyImpulseAtPoint(characterMassForce, standingForcePoint, true);
			}
		}

		/**
		 * Apply drag force if it's not moving
		 */
		if (
			!forward &&
			!backward &&
			!leftward &&
			!rightward &&
			canJump &&
			joystickDis === 0 &&
			!isPointMoving &&
			!gamepadKeys.forward &&
			!gamepadKeys.backward &&
			!gamepadKeys.leftward &&
			!gamepadKeys.rightward
		) {
			// not on a moving object
			if (!isOnMovingObject) {
				dragForce.set(-currentVel.x * dragDampingC, 0, -currentVel.z * dragDampingC);
				characterRef.current.applyImpulse(dragForce, false);
			}
			// on a moving object
			else {
				dragForce.set(
					(movingObjectVelocity.x - currentVel.x) * dragDampingC,
					0,
					(movingObjectVelocity.z - currentVel.z) * dragDampingC
				);
				characterRef.current.applyImpulse(dragForce, true);
			}
		}

		/**
		 * Detect character falling state
		 */
		isFalling = currentVel.y < 0 && !canJump ? true : false;

		/**
		 * Apply larger gravity when falling
		 */
		if (characterRef.current) {
			if (currentVel.y < fallingMaxVel && characterRef.current.gravityScale() !== 0) {
				characterRef.current.setGravityScale(0, true);
			} else if (isFalling && characterRef.current.gravityScale() !== fallingGravityScale) {
				characterRef.current.setGravityScale(fallingGravityScale, true);
			} else if (!isFalling && characterRef.current.gravityScale() !== initialGravityScale) {
				characterRef.current.setGravityScale(initialGravityScale, true);
			}
		}

		/**
		 * Apply auto balance force to the character
		 */
		if (autoBalance && characterRef.current) autoBalanceCharacter();

		/**
		 * Camera collision detect
		 */
		camCollision && cameraCollisionDetect(delta);

		/**
		 * Point to move feature
		 */
		isModePointToMove && pointToMove(delta, slopeAngle, movingObjectVelocity);

		/**
		 * Apply all the animations
		 */
		if (animated) {
			if (
				!forward &&
				!backward &&
				!leftward &&
				!rightward &&
				!jump &&
				!button1Pressed &&
				joystickDis === 0 &&
				!isPointMoving &&
				!gamepadKeys.forward &&
				!gamepadKeys.backward &&
				!gamepadKeys.leftward &&
				!gamepadKeys.rightward &&
				canJump
			) {
				idleAnimation();
			} else if ((jump || button1Pressed) && canJump) {
				jumpAnimation();
			} else if (
				canJump &&
				(forward ||
					backward ||
					leftward ||
					rightward ||
					joystickDis > 0 ||
					isPointMoving ||
					gamepadKeys.forward ||
					gamepadKeys.backward ||
					gamepadKeys.leftward ||
					gamepadKeys.rightward)
			) {
				run || runState ? runAnimation() : walkAnimation();
			} else if (!canJump) {
				jumpIdleAnimation();
			}
			// On high sky, play falling animation
			if (rayHit == null && isFalling) {
				fallAnimation();
			}
		}
	});
</script>

<RigidBody
	colliders={false}
	ref={characterRef}
	position={props.position || [0, 5, 0]}
	friction={props.friction || -0.5}
	onContactForce={(e) => bodyContactForce.set(e.totalForce.x, e.totalForce.y, e.totalForce.z)}
	onCollisionExit={() => bodyContactForce.set(0, 0, 0)}
	userData={{ canJump: false }}
	{...props}
>
	<CapsuleCollider name="character-capsule-collider" args={[capsuleHalfHeight, capsuleRadius]} />
	<!-- {/* Body collide sensor (only for point to move mode) */} -->
	{#if isModePointToMove}
		<CylinderCollider
			ref={bodySensorRef}
			sensor
			args={[capsuleHalfHeight / 2, capsuleRadius]}
			position={[0, 0, capsuleRadius / 2]}
			onIntersectionEnter={handleOnIntersectionEnter}
			onIntersectionExit={handleOnIntersectionExit}
		/>
	{/if}
	<T.Group bind:ref={characterModelRef} userData={{ camExcludeCollision: true }}>
		<T.Mesh
			position={[rayOriginOffest.x, rayOriginOffest.y, rayOriginOffest.z + slopeRayOriginOffest]}
			bind:ref={slopeRayOriginRef}
			visible={showSlopeRayOrigin}
			userData={{ camExcludeCollision: true }}
		>
			<T.BoxGeometry args={[0.15, 0.15, 0.15]} />
		</T.Mesh>
		<slot />
		<!-- {children} -->
	</T.Group>
</RigidBody>

<svelte:window on:visibilitychange={sleepCharacter} />
