<?php

namespace Rollguys\Rollone\App\Service;

use Rollguys\Rollone\App\Model\DiceTower;
use Rollguys\Rollone\App\Service\DiceInjectionMolder;

class DiceService {

    /**
     * @return array
     */
    public function rollDices($sides) {
        $diceTower = new DiceTower();
        $diceInjectionMolder = new DiceInjectionMolder();
        $dices = $diceInjectionMolder->injectDices(1,$sides);

        return $diceTower->use($dices);
    }
}