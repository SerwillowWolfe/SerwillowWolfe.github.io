window.userId=11;
window.timerId=0;

var timer=new Object();
timer.inProgress=false;

var speedX=20;

vkBridge.send('VKWebAppInit', {});
// чтобы ловить события в консоль:
vkBridge.subscribe((e) => {
  if(e.detail.type=="VKWebAppGetUserInfoResult"){
    window.userId=e.detail.data.id;
  }
});

vkBridge.send("VKWebAppGetUserInfo");

let canvas = document.getElementById('roulette');
let ctx = canvas.getContext('2d');
let inProgress=false;

function randomInteger(min, max) {
  // случайное число от min до (max+1)
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}

let renderer=new Renderer();
let camera=new Camera(0, 0, canvas.width, 300);
renderer.addCam(camera);

let gameWorldObjects=new Array();

for (i=0; i<50; i++){
    let chance=randomInteger(1, 100);
     if(chance<=70){
        obj=new GameObject(i*canvas.height+i*30, 0, canvas.height+30, canvas.height, "src/smallPrize.png", false, false, false, 1000000);
        obj.prizeType="small";
     }
     if(chance>70 && chance<=85){
        obj=new GameObject(i*canvas.height+i*30, 0, canvas.height+30, canvas.height, "src/mediumPrize.png", false, false, false, 1000000);
        obj.prizeType="medium";
     }
     if(chance>85 && chance<=95){
        obj=new GameObject(i*canvas.height+i*30, 0, canvas.height+30, canvas.height, "src/bigPrize.png", false, false, false, 1000000);
        obj.prizeType="big";
     }
     if(chance>95){
        obj=new GameObject(i*canvas.height+i*30, 0, canvas.height+30, canvas.height, "src/superPrize.png", false, false, false, 1000000);
        obj.prizeType="super";
     }
     gameWorldObjects[i]=obj;
     renderer.addObject(obj);
}

renderer.addObject(new GameObject(canvas.width/2-5, 0, 10, canvas.height, "src/ukaz.png", false, false, false, 0));

function render(){
    renderer.update(ctx, renderer);
    if(speedX<0){
        let dot=new Dot(canvas.width/2, canvas.height/2);
        let ids=renderer.countDrawbleObjects(0);
        let objects=renderer.getDotObjects(dot, renderer, ids);
        let prizeObject=renderer.objects[objects[0]];
        /*
        1. при покупке часа на Ps + пол часа бесплатно
        2. при покупке часов в гейминге + час бесплатно
        3. двойное кол-во кубков при покупке часов/пакетов
        */
        let k=randomInteger(1, 3);
        let prizeTxt="";
        switch (prizeObject.prizeType){
            case "small":
                switch(k){
                    case 1:
                        prizeTxt="При покупке 1 часа на Ps4 ты получаешь 30 минут бесплатно!";
                    break;
                    case 2:
                        prizeTxt="При покупке часов в Gaming зоне ты получаешь 1 час бесплатно!";
                    break;
                    case 3:
                        prizeTxt="Ты получаешь двойное количество кубков при покупке часов или пакетов времени!";
                    break;
                }
            break;
            case "medium":
                switch(k){
                    case 1:
                        prizeTxt="Приходи с другом, покупайте часы и получите скидку 50%!";
                    break;
                    case 2:
                        prizeTxt="Ты получаешь скидку 50% на PS4 и PS5 при покупке пакета ТОП на 3 часа!";
                    break;
                    case 3:
                        prizeTxt="Ты получаешь 50 кубков на аккаунт совершенно бесплатно!";
                    break;
                }
            break;
            case "big":
                switch(k){
                    case 1:
                        prizeTxt="Тебе выпало 100 кубков на аккаунт совершенно бесплатно!";
                    break;
                    case 2:
                        prizeTxt="Тебе выпала скидка 50% для компании из 3 человек!";
                    break;
                    case 3:
                        prizeTxt="Тебе выпала скидка 50% на PS4 и PS5 при покупке пакета ночь!";
                    break;
                }
            break;
            case "super":
                switch(k){
                    case 1:
                        prizeTxt="ВАУ! Получи 3 бесплатных часа в Gaming зоне.";
                    break;
                    case 2:
                        prizeTxt="ВАУ! Получи 2 часа бесплатно на PS4.";
                    break;
                    case 3:
                        prizeTxt="ВАУ! Получи 2 бесплатных часа в VIP зоне.";
                    break;
                }
            break;
        }
        document.getElementById('prizeZoneTxt').innerText=prizeTxt;
        clearInterval(inter);
        let xhr=new XMLHttpRequest();
        xhr.open('GET', 'server/sendPrize.php?user_id='+window.userId+"&prize_txt="+prizeTxt, true);
        xhr.send();
        inProgress=false;
    }else{
        for(i=0; i<50; i++){
            gameWorldObjects[i].x-=speedX;
        }
        speedX-=0.03;
    }
}

function btnClick(){
  let xhr=new XMLHttpRequest();
  xhr.open('GET', 'server/getUser.php?user_id='+window.userId, true);
  xhr.send();
  xhr.onreadystatechange=function(){
      json_response=JSON.parse(xhr.response);
      if(json_response.status=="roll"){
        roll();
      }else{
        if(!timer.inProgress){
          let time=json_response.next_roll;
          time=time.split('-');
          timer.hours=time[0];
          timer.minutes=time[1];
          timer.seconds=time[2];
          timerId=setInterval(timerCount, 1000);
          document.getElementById('prizeZoneTxt').innerHTML="До следующего вращения <br>"+timer.hours+":"+timer.minutes+":"+timer.seconds;
          timer.inProgress=true;
        }
      }
  }
}

function timerCount(){
  if(timer.seconds==1){
      if(timer.minutes==0){
        if(timer.hours==0){
          timer.minutes=59;
          timer.seconds=59;
          timer.hours-=1;
        }
      }else{
        timer.seconds=59;
        timer.minutes-=1;
      }
  }else{
    timer.seconds-=1;
  }

  darwSec=timer.seconds;
  drawHrs=timer.hours;
  drawMin=timer.minutes;


  if(timer.seconds<10){
    timer.seconds="0"+timer.seconds;
  }
  if(timer.minutes<10){
    timer.minutes="0"+timer.minutes;
  }
  if(timer.hours<10){
    timer.hours="0"+timer.hours;
  }

  document.getElementById('prizeZoneTxt').innerHTML="До следующего вращения <br>"+timer.hours+":"+timer.minutes+":"+timer.seconds;
}

function roll(){
    if(!inProgress){
        renderer=new Renderer();
        renderer.addCam(camera);
        gameWorldObjects=new Array();
        speedX=randomInteger(18, 22);
        for (i=0; i<50; i++){
            let chance=randomInteger(1, 100);
             if(chance<=70){
                obj=new GameObject(i*canvas.height+i*30, 0, canvas.height+30, canvas.height, "src/smallPrize.png", false, false, false, 1000000);
                obj.prizeType="small";
             }
             if(chance>70 && chance<=85){
                obj=new GameObject(i*canvas.height+i*30, 0, canvas.height+30, canvas.height, "src/mediumPrize.png", false, false, false, 1000000);
                obj.prizeType="medium";
             }
             if(chance>85 && chance<=95){
                obj=new GameObject(i*canvas.height+i*30, 0, canvas.height+30, canvas.height, "src/bigPrize.png", false, false, false, 1000000);
                obj.prizeType="big";
             }
             if(chance>95){
                obj=new GameObject(i*canvas.height+i*30, 0, canvas.height+30, canvas.height, "src/superPrize.png", false, false, false, 1000000);
                obj.prizeType="super";
             }
             gameWorldObjects[i]=obj;
             renderer.addObject(obj);
        }
        renderer.addObject(new GameObject(canvas.width/2-5, 0, 10, canvas.height, "src/ukaz.png", false, false, false, 0));
        window.inter=setInterval(render, 13);

        inProgress=true;


    }

}

window.onload=function(){
    renderer.update(ctx, renderer);
}
