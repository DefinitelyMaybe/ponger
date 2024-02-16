<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { World } from '@threlte/rapier';
	import Scene from '$lib/components/Scene.svelte';
	import '../app.css';
</script>

<div class="w-screen h-screen">
	<Canvas>
		<World>
			<Scene />
		</World>
	</Canvas>
</div>
