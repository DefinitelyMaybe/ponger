import type { PlayersQuery } from './components/state';

export function OutOfBounds(query: PlayersQuery) {
	for (const { position } of query) {
		if (position.y < -25) {
			// reset();
			console.log('player out of bounds');
		}
	}
}

function reset() {
	// playerVelocity.set(0, 0, 0);
	// player.position.set(15.75, -3, 30);
	// camera.position.sub(controls.target);
	// controls.target.copy(player.position);
	// camera.position.add(player.position);
	// controls.update();
}
