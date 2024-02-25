<script lang="ts">
	import '../app.css';
	import { Canvas } from '@threlte/core';
	import { World } from '@threlte/rapier';
	import Scene from '$lib/components/scene.svelte';
	import { Pane, Checkbox } from 'svelte-tweakpane-ui';
	import { physicsDebug, performanceDebug } from '$lib/components/state';
</script>

<Pane position="fixed" title="dev">
	<Checkbox bind:value={$physicsDebug} label="physics Debug" />
	<Checkbox bind:value={$performanceDebug} label="performance Debug" />
</Pane>

<div class="w-screen h-screen">
	<Canvas>
		<World>
			<Scene />
		</World>
	</Canvas>
</div>
