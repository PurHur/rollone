<?php

namespace Rollguys\Rollone\App\Model;

class Dice {

    private $sides;

    public function __construct(int $sides) {
        $this->sides = $sides;
    }

    public function throw() {
        return rand(1, $this->sides);
    }

    /**
     * @return int
     */
    public function getSides(): int
    {
        return $this->sides;
    }
}