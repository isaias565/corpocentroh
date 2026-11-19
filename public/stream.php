<?php
// Live Icecast/Shoutcast HTTPS audio proxy for cPanel static + PHP deployments.
// Allows https://corpocentroh.com to play HTTP radio streams without Mixed Content errors.

declare(strict_types=1);

$streams = [
    'lacentro'     => 'http://198.204.234.10:6175/lacentro',
    'pinares'      => 'http://198.204.234.10:6184/live',
    'sensa'        => 'http://198.204.234.10:6185/live',
    'sentimientos' => 'http://198.204.234.10:6186/live',
];

if (isset($_GET['ping'])) {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('Access-Control-Allow-Origin: *');
    echo json_encode(['ok' => true, 'stations' => array_keys($streams)]);
    exit;
}

$station = strtolower(trim((string) ($_GET['station'] ?? '')));
if (!isset($streams[$station])) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Emisora no encontrada']);
    exit;
}

$targetUrl = $streams[$station];

@set_time_limit(0);
@ignore_user_abort(false);
@ini_set('zlib.output_compression', '0');
@ini_set('output_buffering', '0');
@ini_set('implicit_flush', '1');
if (function_exists('apache_setenv')) {
    @apache_setenv('no-gzip', '1');
}

while (ob_get_level() > 0) {
    @ob_end_clean();
}

header('Content-Type: audio/mpeg');
header('Cache-Control: no-store, no-cache, must-revalidate, private');
header('Pragma: no-cache');
header('X-Accel-Buffering: no');
header('Content-Encoding: none');
header('Access-Control-Allow-Origin: *');
header('Accept-Ranges: none');

if (function_exists('curl_init')) {
    $ch = curl_init($targetUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => false,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT        => 0,
        CURLOPT_BUFFERSIZE     => 8192,
        CURLOPT_USERAGENT      => 'CORPOCENTROH-WebPlayer/2.0',
        CURLOPT_HTTPHEADER     => ['Accept: audio/mpeg, audio/*;q=0.9, */*;q=0.8'],
        CURLOPT_WRITEFUNCTION  => static function ($curlHandle, string $chunk): int {
            if (connection_aborted()) {
                return 0;
            }
            echo $chunk;
            flush();
            return strlen($chunk);
        },
    ]);
    $ok = curl_exec($ch);
    $errNo = curl_errno($ch);
    curl_close($ch);

    if ($ok === false && $errNo !== 0 && !headers_sent()) {
        http_response_code(502);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'No se pudo conectar con la emisora']);
    }
    exit;
}

// Fallback when PHP cURL extension is unavailable
$ctx = stream_context_create([
    'http' => [
        'method'  => 'GET',
        'timeout' => 10,
        'header'  => "User-Agent: CORPOCENTROH-WebPlayer/2.0\r\nAccept: audio/mpeg, */*\r\n",
    ],
]);

$fp = @fopen($targetUrl, 'rb', false, $ctx);
if ($fp === false) {
    http_response_code(502);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'No se pudo conectar con la emisora']);
    exit;
}

while (!feof($fp) && !connection_aborted()) {
    $buf = fread($fp, 8192);
    if ($buf === false || $buf === '') {
        break;
    }
    echo $buf;
    flush();
}
fclose($fp);
