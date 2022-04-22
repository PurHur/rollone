<?php

namespace  Rollguys\Rollone\App\Model;

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