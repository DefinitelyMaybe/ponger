<script>
	import { useThrelte } from '@threlte/core';
	import { Color, Fog } from 'three';

	const { scene } = useThrelte();

	scene.background = new Color(0x88ccee);
	scene.fog = new Fog(0x88ccee, 0, 100);
</script>
