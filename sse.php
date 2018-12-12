<?php
// server send event
function sendEvent($id='message0', $data=array(), $event='message', $retry = 3)
{
    if (empty($data)) {
        return false;
    }
    // SSE Ready
    header('Content-Type: text/event-stream');
    header('Cache-Control: no-cache');

    // Set data line
    define('LF', "\n");
    $eventData = 'id: '.$id.LF;
    $eventData .= 'event: '.$event.LF;
    $eventData .= 'retry: '.($retry*1000).LF;
    $eventData .= 'data: '.json_encode($data).LF.LF;

    // print
    print $eventData;
    // Flush write buffers
    flush();
    ob_flush();

    // event count
    // $count[$event]++;
}

// Option
$interval = 60; // second
$retry = 3; // second
$count = array(
    'message' => 0,
    'session' => 0,
);

// first message
/* $eventStart = false;
if (!$eventStart) {
    $id = 'message'.(string)$count['message'];
    $data = array(
        'time' => date("Y-m-d H:i:s", time()),
        'log' => 'READY',
    );
    sendEvent($id, $data, 'message', $retry);
    $eventStart = true;
} */

// send session data
while (true) {
    // session_start();

    $id = 'session'.(string)$count['session'];
    $data = array(
        'time' => date("Y-m-d H:i:s", time()),
        // 'value' => $_SESSION,
        'log' => 'SESSIONDATA '.(string)$count['session'].' RESIVED',
    );

    // Event send
    sendEvent($id, $data, 'session', $retry);
    // event count
    $count['session']++;
    // Interval
    sleep($interval);

}
