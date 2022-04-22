<?php

class DiceSpritzgussMolder {

    public function spritzgussDices(int $diceCount, int $diceSides) {
        $dices = [];
        for ($i = 0; $i < $diceCount; $i++) {
            $dices[] = new Dice($diceSides);
        }
        return $dices;
    }

}