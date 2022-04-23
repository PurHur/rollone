<?php

require_once __DIR__ . '/../backend/php/vendor/autoload.php';

//$controllerName = "DiceController";
$actionName = "journalAction";

/** @var mixed $controller */
$diceService = new \Rollguys\Rollone\App\Service\DiceService();
$controller = new \Rollguys\Rollone\App\Controller\DiceController($diceService);

$response = $controller->$actionName($request);
return $response;

