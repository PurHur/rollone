<?php

namespace Rollguys\Rollone;

use Rollguys\Rollone\App\DiceTower;
use Rollguys\Rollone\App\DiceInjectionMolder;

class DiceService {
    public function rollDices() {
        return (new DiceTower())->use(
            (new DiceInjectionMolder())->spritzgussDices(1,6)
        );
    }
}