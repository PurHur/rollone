<?php
/**
 * Created by PhpStorm.
 * Author: Philip Maaß
 * Date: 22.04.22
 * Time: 11:42
 * License
 */

namespace Rollguys\Rollone;

use Rollguys\Rollone\Random;

class DiceController
{
    public function rollDiceAction()
    {
      return Random::getSeed();
    }
}