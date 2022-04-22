<?php

class Dice {

    private $sides;

    public function __construct(int $sides) {
        $this->sides = $sides;
    }

    public function throw() {
        return rand(1, $this->sides);
    }

}