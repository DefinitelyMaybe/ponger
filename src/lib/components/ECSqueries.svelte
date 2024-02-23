<script lang="ts">
	import type { World } from 'miniplex';
	import { getContext } from 'svelte';
	import { queries } from './state';

	const world: World = getContext('ecs');

	if (world == undefined) {
		throw new Error('no ecs context found');
	}

	$queries = {
		physics: world.with('physics'),
		players: world.with('isPlayer')
	};
</script>
