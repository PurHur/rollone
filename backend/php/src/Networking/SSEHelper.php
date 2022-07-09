<?php

namespace Rollguys\Rollone\Networking;

use React\Http\Io\ServerRequest;
use React\EventLoop\Loop;

class SSEHelper
{
    /**
     * @var array<Stream>
     */
    protected $privateConnections = [];

    /**
     * @param \React\HttpClient\Request $request
     *
     * @return bool
     */
    public function isSSEConnectionRequest($request)
    {
        if (in_array('text/event-stream', $request->getHeader('Accept'))) {
            return true;
        }

        return false;
    }

    /**
     * @param \React\HttpClient\Request $request
     * @param \React\Stream\ThroughStream $broadcastStream
     *
     * @return \React\Http\Message\Response
     */
    public function handleIncomingConnection($request, $broadcastStream)
    {
        if ($this->isSSEConnectionRequest($request)) {
            echo "incomming sse connection: " . $request->getHeaderLine('Last-Event-ID') . PHP_EOL;

            return $this->getStreamingResponse($broadcastStream,$request);
        }

        return new \React\Http\Message\Response(
            500,
            array(
                'Content-Type' => 'text/html'
            ),
            '<h1>500</h1><p>xInternal Server Error</p>'
        );
    }

    /**
     * @param \React\Stream\ThroughStream $broadcastStream
     * @param ServerRequest $request
     * @return \React\Http\Message\Response
     */
    public function getStreamingResponse($broadcastStream,$request)
    {
        // create a stream and format it as sse data
        $privateStream = new \React\Stream\ThroughStream();

        $sessId = $request->getCookieParams()['PHPSESSID'];
        $this->privateConnections[$sessId] = $privateStream;

        $broadcastStream->pipe($privateStream);

        $name = \Rollguys\Rollone\App\Model\NameGenerator::generate();

        $loop = Loop::get();
        $loop->futureTick(function () use ($privateStream, $name) {
            $privateStream->write(SSEHelper::generateSSEEvent("name",$name));
        });

        // send connection data to browser
        return new \React\Http\Message\Response(
            200,
            array(
                'Content-Type'      => 'text/event-stream',
                'Cache-Control'     => 'no-cache',
                'X-Accel-Buffering' => 'no',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Headers' => '*',
                'Access-Control-Allow-Methods' => '*',
                'Access-Control-Allow-Credentials' => 'true'
            ),
            $privateStream
        );
    }

    /**
     * @param string $phpsessid
     * @return \React\Stream\ThroughStream|null
     */
    public function getPrivateStreamByPHPSESSID($phpsessid) {
        return isset($this->privateConnections[$phpsessid])?$this->privateConnections[$phpsessid]:null;
    }

    /**
     * @param $event
     * @param $data
     *
     * @return string
     */
    public static function generateSSEEvent($event, $data) {
        $messageJournal = new \Rollguys\Rollone\App\Model\MessageJournal();

        $id = $messageJournal->getLastMessageId() +1 ;
        $event = 'id: '.$id."\n".'event: ' . $event . "\n" . 'data: ' . $data . "\n\n";

        $messageJournal->writeDown($id,$event,$data);

        return $event;
    }
}
