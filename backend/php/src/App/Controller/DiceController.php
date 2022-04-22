<?php
/**
 * Created by PhpStorm.
 * Author: Philip Maaß
 * Date: 22.04.22
 * Time: 11:42
 * License
 */

namespace Rollguys\Rollone\App\Controller;

use Rollguys\Rollone\App\Service\DiceService;
use Rollguys\Rollone\Networking\SSEHelper;

class DiceController
{
    /**
     * @var DiceService
     */
    private $diceService;

    /**
     * @param DiceService $diceService
     */
    public function __construct(DiceService $diceService)
    {
        $this->diceService = $diceService;
    }

    /**
     * @return string
     */
    public function rollDiceAction()
    {
        $result = $this->diceService->rollDices();

        return SSEHelper::generateSSEEvent("roll",'{"rolls": '.json_encode($result).'}');
    }
}