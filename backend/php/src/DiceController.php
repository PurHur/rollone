<?php
/**
 * Created by PhpStorm.
 * Author: Philip Maaß
 * Date: 22.04.22
 * Time: 11:42
 * License
 */

namespace Rollguys\Rollone;

use Rollguys\Rollone\DiceService;

class DiceController
{
    /**
     * @var DiceService
     */
    private $diceService;

    public function __construct(DiceService $diceService)
    {
        $this->diceService = $diceService;
    }

    public function rollDiceAction()
    {
        $dicesResult = $this->diceService->rollDices();
    }
}