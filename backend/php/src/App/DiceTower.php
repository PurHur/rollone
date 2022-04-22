<?php

namespace  Rollguys\Rollone\App;

class DiceTower {
    public function use($dices)
    {
        $result = 0;

        foreach ($dices as $dice) {
            $result += $dice->throw();
        }

        return $result;
    }
}