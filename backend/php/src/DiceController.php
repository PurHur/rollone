<?php
/**
 * Created by PhpStorm.
 * Author: Philip Maaß
 * Date: 22.04.22
 * Time: 11:42
 * License
 */

namespace Rollguys\Rollone;

class DiceController
{
    public function rollDiceAction()
    {
      return Random::getSeed();
    }
}