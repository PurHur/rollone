<?php

namespace  Rollguys\Rollone\App\Model;

class DiceTower
{
    /**
     * @var array $dices
     *
     * @return array
     */
    public function use($dices)
    {
        $result = [];

        foreach ($dices as $key => $dice) {
            $result[$key] = $dice->roll();
        }

        return $result;
    }
}