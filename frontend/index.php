<?php

require_once __DIR__ . '/../backend/php/vendor/autoload.php';

//$controllerName = "DiceController";
$actionName = "rollDiceAction";

/*
if(isset($_GET['controller'])) {
    $controllerName = $_GET['controller'];
}

if(isset($_GET['action'])) {
    $actionName = $_GET['action'];
}
*/

/** @var mixed $controller */
$diceService = new \Rollguys\Rollone\App\Service\DiceService();
$controller = new \Rollguys\Rollone\App\Controller\DiceController($diceService);

$response = $controller->$actionName($request);
$broadcastStream->write($response);
