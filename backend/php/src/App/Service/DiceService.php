<?php

namespace Rollguys\Rollone\App\Service;

use Rollguys\Rollone\App\Model\DiceTower;
use Rollguys\Rollone\App\Service\DiceInjectionMolder;

class DiceService {
    public function rollDices() {
        $diceTower = new DiceTower();
        $diceInjectionMolder = new DiceInjectionMolder();
        $dices = $diceInjectionMolder->injectDices(1,6);

        return $diceTower->use($dices);
    }
}