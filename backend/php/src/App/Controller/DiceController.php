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
    public function rollDiceAction($request)
    {
        $sides = $request->getQueryParams()['sides'];
        $dicesResult = $this->diceService->rollDices($sides);
        $username = $request->getCookieParams()['username'];
        $result = [
            "rolls" => $dicesResult,
            "sides" => $sides,
            "roller" => $username
        ];

        return SSEHelper::generateSSEEvent("roll",json_encode($result));
    }

    public function journalAction($request) {
        $messageJournal = new \Rollguys\Rollone\App\Model\MessageJournal();
        $result = $messageJournal->getJournal();

        return json_encode($result);
    }

}