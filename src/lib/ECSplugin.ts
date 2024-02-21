import { injectPlugin } from '@threlte/core';
import type * as THREE from 'three';
import { World } from 'miniplex';

const isEntity = (ref: any): ref is any => {
	return ref.isEntity;
};

type entity = {
	position: THREE.Vector3;
};

// make this into a context object instead that all entities can hook into
const world = new World<entity>();

export const injectECSPlugin = () => {
	injectPlugin('bvh-raycast', ({ ref }) => {
		if (isEntity(ref)) {
			world.add(ref);
		}
		return {
			onRefChange(ref) {
				return () => {
					if (isEntity(ref)) {
						world.remove(ref);
					}
				};
			}
		};
	});
};
