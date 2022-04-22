<?php

class DiceService {
    public function rollDices() {
        return (new DiceTower())->use(
            (new DiceSpritzgussMolder())->spritzgussDices(1,6)
        );
    }
}