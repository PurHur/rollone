<?php
namespace Rollguys\Rollone\App\Service;

use Rollguys\Rollone\App\Model\Dice;

class DiceInjectionMolder {

    /**
     * @param int $diceCount
     * @param int $diceSides
     *
     * @return array
     */
    public function injectDices(int $diceCount, int $diceSides) {
        $dices = [];

        for ($i = 0; $i < $diceCount; $i++) {
            $dices[] = new Dice($diceSides);
        }

        return $dices;
    }
}