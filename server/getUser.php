<?php

$dbc=mysqli_connect('localhost', 'root', 'root', 'escd648444_db');

$user_id=$_GET['user_id'];

$sql="SELECT * FROM `users` WHERE `id`='$user_id'";
$result=mysqli_query($dbc, $sql);
if(mysqli_num_rows($result)==0){
    $date=time();
    $sql="INSERT INTO `users`(`id`, `last_game`) VALUES ('$user_id','$date')";
    mysqli_query($dbc, $sql);
    $response=array(
      "status"=>"roll"
    );
    echo json_encode($response);
}else{
    $row=mysqli_fetch_array($result, MYSQLI_ASSOC);
    $last_roll=$row['last_game'];
    $time_now=time();
    $difficalty=$time_now-$last_roll;


    $roll=false;

    if($difficalty>71*60*60-60){
      $roll=true;
    }

    if($roll){
      $date=time();
      $sql="UPDATE `users` SET `last_game`='$date' WHERE `id`='$user_id'";
      mysqli_query($dbc, $sql);
      $response=array(
        "status"=>"roll"
      );
      echo json_encode($response);
    }else{
      $sec_before_next_roll=71*60*60-60-$difficalty;
      $hrs=round($sec_before_next_roll/3600);
      $sec_before_next_roll=fmod($sec_before_next_roll, 3600);
      $mins=round($sec_before_next_roll/60);
      $sec_before_next_roll=fmod($sec_before_next_roll, 60);
      $time=array(
        'hours'=>$hrs,
        'minutes'=>$mins,
        'seconds'=>$sec_before_next_roll
      );

      $response=array(
        "status"=>"notRoll",
        "next_roll"=>implode("-", $time)
      );
      echo json_encode($response);
    }
}
?>
