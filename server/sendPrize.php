<?php

function send_message($message, $peer_id, $random_id, $token){
    $request_params = array(
        'message' => $message,
        'peer_id' => $peer_id,
        'access_token' => $token,
        'random_id'=> $random_id,
        'v' => '5.101'
    );
    $get_params = http_build_query($request_params);
    file_get_contents('https://api.vk.com/method/messages.send?'. $get_params);
}

$token = '9c2a27f7b7fd86e8269dee93b29523623b14e305586b2321e246daa40f0838df54ef9d3c6d46287f83787';

$user_id=$_GET['user_id'];

$prizeTxt=$_GET['prize_txt'];

$random_id=$user_id+random_int( 100000 , 999999 );

send_message($prizeTxt, $user_id, $random_id, $token);

?>
