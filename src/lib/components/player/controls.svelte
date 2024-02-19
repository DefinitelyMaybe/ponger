<script>
	import {
		fwdPressed,
		bkdPressed,
		lftPressed,
		rgtPressed,
		playerIsOnGround,
		playerVelocity
	} from './state';
</script>

<svelte:window
	on:keydown={(event) => {
		switch (event.code) {
			case 'KeyW':
				$fwdPressed = true;
				break;
			case 'KeyS':
				$bkdPressed = true;
				break;
			case 'KeyD':
				$rgtPressed = true;
				break;
			case 'KeyA':
				$lftPressed = true;
				break;
			case 'Space':
				if ($playerIsOnGround) {
					$playerVelocity.y = 10.0;
					$playerIsOnGround = false;
				}
				break;
		}
	}}
	on:keyup={(event) => {
		switch (event.code) {
			case 'KeyW':
				$fwdPressed = false;
				break;
			case 'KeyS':
				$bkdPressed = false;
				break;
			case 'KeyD':
				$rgtPressed = false;
				break;
			case 'KeyA':
				$lftPressed = false;
				break;
		}
	}}
/>
