<?php
namespace Rollguys\Rollone\App\Service;

use Rollguys\Rollone\App\Model\Dice;

class DiceInjectionMolder {
    public function spritzgussDices(int $diceCount, int $diceSides) {
        $dices = [];
        for ($i = 0; $i < $diceCount; $i++) {
            $dices[] = new Dice($diceSides);
        }
        return $dices;
    }
}