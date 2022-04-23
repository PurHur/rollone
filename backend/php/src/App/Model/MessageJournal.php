<?php

namespace  Rollguys\Rollone\App\Model;

class MessageJournal
{
    static $journal;

    static $counter;

    public function writeDown($id, $event, $data)
    {
        self::$journal[] = [
            'id' => $id,
            'event' => $event,
            'data' => $data,
        ];

        self::$counter++;
    }

    public function getLastMessageId() {
        return self::$counter;
    }
}