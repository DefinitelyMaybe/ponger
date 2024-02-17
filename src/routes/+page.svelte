<script lang="ts">
	import '../app.css';
	import { Canvas } from '@threlte/core';
	import Scene from '$lib/components/scene.svelte';
	import { Pane, Checkbox } from 'svelte-tweakpane-ui';
	import { physicsDebug } from '$lib/components/state';
</script>

<Pane>
	<Checkbox bind:value={$physicsDebug} label="physics Debug" />
</Pane>

<div class="w-screen h-screen">
	<Canvas>
		<Scene />
	</Canvas>
</div>
