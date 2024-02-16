<script lang="ts">
	import { T } from '@threlte/core';
	import { ContactShadows, Float, Grid, OrbitControls } from '@threlte/extras';
	import Background from './background.svelte';

	const GRAVITY = 30;

	const NUM_SPHERES = 100;
	const SPHERE_RADIUS = 0.2;

	const STEPS_PER_FRAME = 5;

	// const spheres = [];
	// let sphereIdx = 0;

	// const sphereGeometry = new IcosahedronGeometry(SPHERE_RADIUS, 5);
	// const sphereMaterial = new MeshLambertMaterial({ color: 0xdede8d });

	// for (let i = 0; i < NUM_SPHERES; i++) {
	// 	const sphere = new Mesh(sphereGeometry, sphereMaterial);
	// 	sphere.castShadow = true;
	// 	sphere.receiveShadow = true;

	// 	spheres.push({
	// 		mesh: sphere,
	// 		collider: new Sphere(new Vector3(0, -100, 0), SPHERE_RADIUS),
	// 		velocity: new Vector3()
	// 	});
	// }
</script>

<Background />

<T.PerspectiveCamera makeDefault position={[-10, 10, 10]} fov={70} near={0.1} far={1000}>
	<OrbitControls autoRotate enableZoom={false} enableDamping autoRotateSpeed={0.5} target.y={1.5} />
</T.PerspectiveCamera>

<T.DirectionalLight args={[0xffffff, 2.5]} intensity={0.8} position={[-5, 25, -1]} castShadow />
<!-- directionalLight.shadow.camera.near = 0.01;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.right = 30;
directionalLight.shadow.camera.left = -30;
directionalLight.shadow.camera.top = 30;
directionalLight.shadow.camera.bottom = -30;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.radius = 4;
directionalLight.shadow.bias = -0.00006; -->
<T.AmbientLight intensity={0.2} />
<T.HemisphereLight args={[0x8dc1de, 0x00668d, 1.5]} position={[2, 1, 1]} />;

<Grid
	position.y={-0.001}
	cellColor="#ffffff"
	sectionColor="#ffffff"
	sectionThickness={0}
	fadeDistance={25}
	cellSize={2}
/>

<ContactShadows scale={10} blur={2} far={2.5} opacity={0.5} />

<Float floatIntensity={1} floatingRange={[0, 1]}>
	<T.Mesh position.y={1.2} position.z={-0.75}>
		<T.BoxGeometry />
		<T.MeshStandardMaterial color="#0059BA" />
	</T.Mesh>
</Float>

<Float floatIntensity={1} floatingRange={[0, 1]}>
	<T.Mesh position={[1.2, 1.5, 0.75]} rotation.x={5} rotation.y={71}>
		<T.TorusKnotGeometry args={[0.5, 0.15, 100, 12, 2, 3]} />
		<T.MeshStandardMaterial color="#F85122" />
	</T.Mesh>
</Float>

<Float floatIntensity={1} floatingRange={[0, 1]}>
	<T.Mesh position={[-1.4, 1.5, 0.75]} rotation={[-5, 128, 10]}>
		<T.IcosahedronGeometry />
		<T.MeshStandardMaterial color="#F8EBCE" />
	</T.Mesh>
</Float>
