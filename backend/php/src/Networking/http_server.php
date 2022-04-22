<?php

$http = new React\Http\HttpServer(function (Psr\Http\Message\ServerRequestInterface $request) {

    try {

        $httpPath = $request->getUri()->getPath();
        printf("%s\n", $httpPath);
        if($httpPath === '/') {
            $httpPath = '/index.html';
        }

        if ($httpPath === '/roll') {
            $httpPath = '/index.php';
        }

        // restart for autodeployment
        if ($httpPath === '/restart') {
            exit;
        }

        $filePath = "../../../frontend/" . $httpPath;

        if (!file_exists($filePath)) {
            return new React\Http\Message\Response(
                React\Http\Message\Response::STATUS_NOT_FOUND
            );
        }


        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        if ($extension === 'html') {
            $content = file_get_contents($filePath);
            $mime = "text/html";
        } else if ($extension === 'php') {
            $content = include $filePath;
            $mime = "text/html";
        } else {
            $content = file_get_contents($filePath);
            $mime = mime_content_type($filePath);
        }

        return new React\Http\Message\Response(
            React\Http\Message\Response::STATUS_OK,
            [
                'Content-Type' => $mime . '; charset=utf-8'
            ],
            (string)$content
        );
    } catch (\Throwable $e) {
        print_r($e->getMessage());
        print_r($e->getTraceAsString());

        return new React\Http\Message\Response(
            React\Http\Message\Response::STATUS_INTERNAL_SERVER_ERROR,[],$e->getMessage()
        );
    }
});

$socket = new React\Socket\SocketServer('0.0.0.0:8080');

echo "Listening on {$socket->getAddress()}\n";
$http->listen($socket);

