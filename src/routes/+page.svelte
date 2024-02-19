<script lang="ts">
	import '../app.css';
	import { Canvas } from '@threlte/core';
	import Scene from '$lib/components/scene.svelte';
	import { Pane, Checkbox } from 'svelte-tweakpane-ui';
	import { physicsDebug } from '$lib/components/state';

	// const visFolder = gui.addFolder('Visualization');
	// visFolder.add(params, 'displayCollider');
	// visFolder.add(params, 'displayBVH');
	// visFolder.add(params, 'visualizeDepth', 1, 20, 1).onChange((v) => {
	// 	visualizer.depth = v;
	// 	visualizer.update();
	// });
	// visFolder.open();

	// const physicsFolder = gui.addFolder('Player');
	// physicsFolder.add(params, 'physicsSteps', 0, 30, 1);
	// physicsFolder.add(params, 'gravity', -100, 100, 0.01).onChange((v) => {
	// 	params.gravity = parseFloat(v);
	// });
	// physicsFolder.add(params, 'playerSpeed', 1, 20);
	// physicsFolder.open();

	// gui.add(params, 'reset');
	// gui.open();
</script>

<Pane>
	<Checkbox bind:value={$physicsDebug} label="physics Debug" />
</Pane>

<div class="w-screen h-screen">
	<Canvas>
		<Scene />
	</Canvas>
</div>
