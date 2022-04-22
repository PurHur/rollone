<?php

namespace Rollguys\Rollone\Networking;

use React\Http\Io\ServerRequest;
use Symfony\Component\HttpFoundation\Request;

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
     * @return \React\Stream\ThroughStream
     * @todo refactor into new class SSEStream
     */
    public function generateSSEFormatedStream()
    {
        return new \React\Stream\ThroughStream(function ($data) {
            if (is_string($data)) {
                return 'data: ' . $data . "\n\n";
            } else if (is_array($data)) {
                $str = '';

                foreach($data as $key => $value) {
                    $str .= "$key: $value\n";
                }

                return $str . "\n\n";
            }

            return null;
        });
    }

    /**
     * @param \React\Stream\ThroughStream $broadcastStream
     * @param ServerRequest $request
     * @return \React\Http\Response
     */
    public function getStreamingResponse($broadcastStream,$request)
    {
        // create a stream and format it as sse data
        $privateStream = $this->generateSseFormatedStream();

        $sessId = $request->getCookieParams()['PHPSESSID'];
        $this->privateConnections[$sessId] = $privateStream;

        $broadcastStream->pipe($privateStream);

        // send connection data to browser
        return new \React\Http\Response(
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
}
