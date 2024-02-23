<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Grid, PerfMonitor } from '@threlte/extras';
	import Background from './background.svelte';
	import Arena from './arena.svelte';
	import Player from './player/player.svelte';
	import { injectBVHRaycastPlugin } from '../BVHplugin';
	import { injectECSPlugin } from '../ECSplugin';
	import CameraControls from './cameraControls.svelte';
	import { MeshBVHHelper } from 'three-mesh-bvh';
	import ECSQueries from './ECSqueries.svelte';
	import { BVHPhysicsUpdate } from '../BVH-Physics';
	import { OutOfBounds } from '../OutOfBounds';
	import { queries } from './state';

	useTask((delta) => {
		if ($queries) {
			BVHPhysicsUpdate(delta, $queries.physics);
			OutOfBounds($queries.players);
		}
	});

	injectBVHRaycastPlugin();
	injectECSPlugin();
</script>

<PerfMonitor />

<ECSQueries />

<Background />

<T.PerspectiveCamera makeDefault position={[-10, 10, 10]} fov={70} near={0.1} far={100}>
	<!-- <OrbitControls enableDamping target.y={1.5} /> -->
	<CameraControls />
</T.PerspectiveCamera>

<T.DirectionalLight args={[0xffffff, 2.5]} intensity={0.8} position={[-5, 25, -1]} castShadow>
	<!-- <T.DirectionalLightShadow mapSize={[1024, 1024]} radius={4} bias={-0.00006}>
		<T.OrthographicCamera near={0.01} far={500} right={30} left={-30} top={30} bottom={-30} />
	</T.DirectionalLightShadow> -->
</T.DirectionalLight>
<T.AmbientLight intensity={0.2} />
<T.HemisphereLight args={[0x8dc1de, 0x00668d, 1.5]} position={[2, 1, 1]} />;

<Grid
	position.y={-0.001}
	cellColor="#ffffff"
	sectionColor="#ffffff"
	sectionThickness={0}
	cellSize={2}
	infiniteGrid
/>

<!-- <Arena /> -->
<T.Mesh position.y={-0.1} rotation.x={-Math.PI / 2}>
	<T.PlaneGeometry args={[100, 100, 1, 1]} />
	<T.MeshStandardMaterial color="green" />
</T.Mesh>

<Player />

<T.Mesh>
	<T.BoxGeometry />
	<T.MeshStandardMaterial />
</T.Mesh>

<T.Mesh position.x={2}>
	<T.BoxGeometry />
	<T.MeshStandardMaterial color="red" />
</T.Mesh>

<T.Mesh position.y={2}>
	<T.BoxGeometry />
	<T.MeshStandardMaterial color="green" />
</T.Mesh>

<T.Mesh position.z={2}>
	<T.BoxGeometry />
	<T.MeshStandardMaterial color="blue" />
</T.Mesh>
