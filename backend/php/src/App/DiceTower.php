<?php

class DiceTower {
    public function use($dices)
    {
        $result = 0;

        foreach ($dices as $dice) {
            $result += $dice->roll();
        }

        return $result;
    }
}