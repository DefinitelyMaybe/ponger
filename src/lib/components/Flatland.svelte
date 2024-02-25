<script lang="ts">
	import type { StaticPhysicsObject } from '../Entities';
	import { T } from '@threlte/core';
	import { AutoColliders } from '@threlte/rapier';
	import { Vector3 } from 'three';

	const entity: StaticPhysicsObject = {
		physics: true,
		position: new Vector3()
	};
</script>

<AutoColliders>
	<T.Mesh
		receiveShadow
		{entity}
		position.y={-0.1}
		rotation.x={-Math.PI / 2}
		on:create={({ ref }) => {
			entity.position = ref.position;
		}}
	>
		<T.PlaneGeometry args={[100, 100, 1, 1]} />
		<T.MeshStandardMaterial color="green" />
	</T.Mesh>
</AutoColliders>
