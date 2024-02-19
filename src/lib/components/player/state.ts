import { writable } from 'svelte/store';
import { Vector3 } from 'three';

export const fwdPressed = writable(false);
export const bkdPressed = writable(false);
export const lftPressed = writable(false);
export const rgtPressed = writable(false);
export const playerIsOnGround = writable(false);
export const playerVelocity = writable(new Vector3());
