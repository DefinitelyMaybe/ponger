<script lang="ts">
	import { T } from '@threlte/core';
	import { Debug } from '@threlte/rapier';
	import { Grid, PerfMonitor, Sky } from '@threlte/extras';
	import Background from './background.svelte';
	import Land from './Flatland.svelte';
	import Player from './player/player.svelte';
	import CameraControls from './cameraControls.svelte';
	import ECSQueries from './ECSqueries.svelte';
	import { injectECSPlugin } from '../ECSplugin';
	import { physicsDebug, performanceDebug } from './state';

	injectECSPlugin();
</script>

{#if $performanceDebug}
	<PerfMonitor />
{/if}

{#if $physicsDebug}
	<Debug />
{/if}

<ECSQueries />

<Background />

<T.PerspectiveCamera makeDefault position={[-10, 10, 10]} fov={70} near={0.1} far={1000}>
	<CameraControls />
</T.PerspectiveCamera>

<!-- <Grid
	position.y={-0.001}
	cellColor="#ffffff"
	sectionColor="#ffffff"
	sectionThickness={0}
	cellSize={2}
	infiniteGrid
/> -->

<Land />

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
