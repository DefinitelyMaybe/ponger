<script>
	import { T, useThrelte } from '@threlte/core';
	import { Sky } from '@threlte/extras';
	import { Color, Fog } from 'three';

	// const { scene } = useThrelte();

	// scene.background = new Color(0x88ccee);
	// scene.fog = new Fog(0x88ccee, 0, 100);
</script>

<!-- <T.DirectionalLight args={[0xffffff, 2.5]} intensity={0.8} position={[-5, 25, -1]} castShadow> -->
<!-- <T.DirectionalLightShadow mapSize={[1024, 1024]} radius={4} bias={-0.00006}>
		<T.OrthographicCamera near={0.01} far={500} right={30} left={-30} top={30} bottom={-30} />
	</T.DirectionalLightShadow> -->
<!-- </T.DirectionalLight> -->

<!-- <T.AmbientLight intensity={0.2} />
<T.HemisphereLight args={[0x8dc1de, 0x00668d, 1.5]} position={[2, 1, 1]} />; -->

<Sky />
