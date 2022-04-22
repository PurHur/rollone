<?php

namespace  Rollguys\Rollone\App\Model;

class DiceTower {

    /**
     * @var array $dices
     */
    public function use($dices)
    {
        $result = [];

        foreach ($dices as $key => $dice) {
            $result[$key] = $dice->throw();
        }

        return $result;
    }
}