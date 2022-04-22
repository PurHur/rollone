<?php
/**
 * Created by PhpStorm.
 * Author: Philip Maaß
 * Date: 22.04.22
 * Time: 11:42
 * License
 */

namespace Rollguys\Rollone\App\Controller;

use React\Http\Message\Response;
use Rollguys\Rollone\App\Service\DiceService;

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
        $result = $this->diceService->rollDices();

        return json_encode($result);
    }
}