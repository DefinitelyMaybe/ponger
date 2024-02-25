import { writable, type Writable } from 'svelte/store';
import type { Query, With } from 'miniplex';
import type { Player, DynamicPhysicsObject } from '../Entities';

export type PhysicsQuery = Query<With<DynamicPhysicsObject, 'physics' | 'velocity'>>;
export type PlayersQuery = Query<With<Player, 'isPlayer'>>;

export const physicsDebug = writable(false);
export const performanceDebug = writable(false);
export const cameraPos = writable(undefined);
export const queries: Writable<
	| {
			dynamicPhysics: PhysicsQuery;
			players: PlayersQuery;
	  }
	| undefined
> = writable(undefined);
