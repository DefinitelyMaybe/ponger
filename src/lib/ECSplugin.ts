import { injectPlugin } from '@threlte/core';
import type * as THREE from 'three';
import { setContext } from 'svelte';
import { World } from 'miniplex';
import type { Entity } from './Entities';

const isEntity = (ref: any): ref is any => {
	return ref.isEntity;
};

export const injectECSPlugin = () => {
	// make this into a context object instead that all entities can hook into
	const world = new World<Entity>();
	setContext('ecs', world);
	world.onEntityAdded.subscribe((entity) => {
		console.log('entity added:', entity);
	});

	injectPlugin('ecs', ({ ref, props }) => {
		// console.log(props);
		if ('entity' in props) {
			console.log(props);
			// entity is an object
			// in js an object is always passed by reference
			// so you could create the entity within your script tag
			// and then pass it into the entity prop `<T {entity}/>`
			world.add(props.entity);
		}
		return {
			onRefChange(ref) {
				return () => {
					if (isEntity(ref)) {
						world.remove(props.entity);
					}
				};
			}
		};
	});
};
