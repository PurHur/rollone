<?php

$http = new React\Http\HttpServer(function (Psr\Http\Message\ServerRequestInterface $request) {

    $httpPath = $request->getUri()->getPath();
    if ($httpPath === '/') {
        $httpPath = '/index.php';
    }
    $filePath = "../../frontend/".$httpPath;

    if (!file_exists($filePath)) {
        return new React\Http\Message\Response(
            React\Http\Message\Response::STATUS_NOT_FOUND
        );
    }

    $content = file_get_contents($filePath);

    $extension = pathinfo($filePath, PATHINFO_EXTENSION);
    if ($extension === 'html') {
        $mime = "text/html";
    } else if ($extension === 'php') {
        $content = include $filePath;
        $mime = "text/html";
    } else {
        $mime = mime_content_type($filePath);
    }

    return new React\Http\Message\Response(
        React\Http\Message\Response::STATUS_OK,
        [
             'Content-Type' => $mime.'; charset=utf-8'
        ],
        $content
    );
});

$socket = new React\Socket\SocketServer('127.0.0.1:8080');

echo "Listening on {$socket->getAddress()}\n";
$http->listen($socket);

