<?php

namespace Rollguys\Rollone\App\Service;

use Rollguys\Rollone\App\Model\DiceTower;
use Rollguys\Rollone\App\Service\DiceInjectionMolder;

class DiceService {
    public function rollDices() {
        return (new DiceTower())->use(
            (new DiceInjectionMolder())->spritzgussDices(1,6)
        );
    }
}