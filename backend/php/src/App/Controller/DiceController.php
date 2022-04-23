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
        $result = $this->diceService->rollDices($sides);
        $username = implode(",", $this->getallheaders());

        return SSEHelper::generateSSEEvent("roll",'{"rolls": '.json_encode($result).', "sides": '.$sides.', "roller": "'.$username.'"}');
    }

    public function journalAction($request) {
        $messageJournal = new \Rollguys\Rollone\App\Model\MessageJournal();
        $result = $messageJournal->getJournal();

        return json_encode($result);
    }

    private function getallheaders() {
                $headers = [];
                foreach ($_SERVER as $name => $value) {
                    if (substr($name, 0, 5) == 'HTTP_') {
                        $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
                    }
                }
                return $headers;
                }
}