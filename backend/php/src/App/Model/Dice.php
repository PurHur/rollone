<?php

namespace Rollguys\Rollone\App\Model;

class Dice
{
    /**
     * @var int
     */
    private $sides;

    public function __construct(int $sides) {
        $this->sides = $sides;
    }

    /**
     * @return int
     */
    public function roll() {
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