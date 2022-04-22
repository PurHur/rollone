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

$request = [];
/** @var mixed $controller */
$controller = new \Rollguys\Rollone\DiceController();
$response = $controller->$actionName($request);

return  file_get_contents('../../frontend/index.html');