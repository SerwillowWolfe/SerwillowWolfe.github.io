class Renderer {
  constructor() {
    this.objects = [];
    //массив объектов мира
    this.cams = [];
    //массив с камерами
    this.selectedCam = 0;
    this.gravity = 0.05;
  }

  addObject(object) {
    //добавить объект
    let id = this.objects.push(object);
    //возвращает id добавленного объекта
    return id-1;
  }

  setGravity(power) {
    this.gravity = power;
  }

  deleteObject(id) {
    //удаляет объект из списка отрисовываемых
    this.objects[id].drawble = false;
   //очень странный класс
  }

  addCam(camera) {
    //добавление камеры
    let cams = this.cams.push(camera);
    //возвращает id камеры
    return cams--;
  }

  getDotObjects(dot, renderer, ids) {
    //получить объекты на точке Dot
    //аргумент dot принимает объект Dot(точка, в которой мы ищем объекты)
    //ids получает массив id объектов в renderer, среди которых мы ищем
    //такой массив возвращает countDrawbleObjects, однако его можно составить и самому
    let dotObjects = [];
    for (let i = 0; i < ids.length; i++) {
      let countObject = renderer.objects[ids[i]];
      if (dot.x > countObject.x && dot.x < countObject.x + countObject.width && dot.y > countObject.y && dot.y < countObject.y+countObject.height) {
        dotObjects.push(ids[i]);
      }
    }
    //возвращает список id рисуемых объектов
    return dotObjects;
  }

  countDrawbleObjects(cameraId) {
    //получить список id отрисовываемых объектов
    let camera = this.cams[cameraId];
    //получаем камеру
    let drawbleObjects = [];
    //создаём массив объектов
    let cameraPoints = [];
    //создаём массив вершин камеры
    cameraPoints[0]= new Dot(camera.x-200, camera.y-200);
    cameraPoints[1]= new Dot(camera.x + camera.width + 200, camera.y-200);
    cameraPoints[2]= new Dot(camera.x-200, camera.y + camera.height+200);
    cameraPoints[3]= new Dot(camera.x + camera.width+200, camera.y + camera.height+200);
    //считаем все вершины
    for (let i = 0; i < this.objects.length; i++) {
      //перебор всех элементов
      let objectPoints = [];
      //создаём массив вершин объекта
      objectPoints[0] = new Dot(this.objects[i].x, this.objects[i].y);
      objectPoints[1] = new Dot(this.objects[i].x + this.objects[i].width, this.objects[i].y);
      objectPoints[2] = new Dot(this.objects[i].x, this.objects[i].y + this.objects[i].height);
      objectPoints[3] = new Dot(this.objects[i].x + this.objects[i].width, this.objects[i].y + this.objects[i].height);
      //считаем все вершины
      for (let k = 0; k < 4; k++) {
        //проверяем все вершины объекта на принадлежность к отрисовываемой области
        if (objectPoints[k].x > cameraPoints[0].x && objectPoints[k].x < cameraPoints[1].x && objectPoints[k].y > cameraPoints[0].y && objectPoints[k].y < cameraPoints[2].y) {
          //если хоть одна вершина попадает на отрисовываемую область, то...
          if(renderer.objects[i].drawble){
            drawbleObjects.push(i);
          }
          //..добавляем её в список
          k = 4;
          //и закрываем цикл
        }
      }
    }
    return drawbleObjects;
  }

  update(ctx, renderer) {
    //отрисовка
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let drawbleObjects = renderer.countDrawbleObjects(this.selectedCam);
    //console.log(drawbleObjects);
    //получаем список рисуемых объектов
    for (let i = 0; i < drawbleObjects.length; i++) {
      if (renderer.objects[drawbleObjects[i]].physics) {
        //если гравитация включена
        renderer.objects[drawbleObjects[i]].accelerationY += renderer.gravity;
        //прибавляем ускорение по оси y объекту
      }
      renderer.objects[drawbleObjects[i]].speedX += renderer.objects[drawbleObjects[i]].accelerationX;
      renderer.objects[drawbleObjects[i]].speedY += renderer.objects[drawbleObjects[i]].accelerationY;
      //считаем скорость объекта
      if (renderer.objects[drawbleObjects[i]].collision) {
        //если коллизия включена

        if (renderer.objects[drawbleObjects[i]].speedX > 0) {
          //если объект двигается вправо...
          let dots = [];
          dots[0] = new Dot(renderer.objects[drawbleObjects[i]].x + renderer.objects[drawbleObjects[i]].width+1, renderer.objects[drawbleObjects[i]].y);
          dots[1] = new Dot(renderer.objects[drawbleObjects[i]].x + renderer.objects[drawbleObjects[i]].width+1, renderer.objects[drawbleObjects[i]].y + renderer.objects[drawbleObjects[i]].height /2);
          dots[2] = new Dot(renderer.objects[drawbleObjects[i]].x + renderer.objects[drawbleObjects[i]].width+1, renderer.objects[drawbleObjects[i]].y + renderer.objects[drawbleObjects[i]].height-4);
          //...создаём 3 точки коллизии(на правой грани объекта)
          let countbleObjects = renderer.countDrawbleObjects(this.selectedCam);
          //получаем список объектов в поле зрения
          let objectsWithCollision = [];
          //создаём массив объектов с включенной коллизией
          for (let i = 0; i < countbleObjects.length; i++) {
            //проходимся по всем объектам в поле зрения
            if (renderer.objects[countbleObjects[i]].collision) { 
              //и ищем те, у которых включена коллизия
              objectsWithCollision.push(countbleObjects[i]);
            }
          }
          let objs = [];
          objs[0] = renderer.getDotObjects(dots[0], renderer, objectsWithCollision);
          objs[1] = renderer.getDotObjects(dots[1], renderer, objectsWithCollision);
          objs[2] = renderer.getDotObjects(dots[2], renderer, objectsWithCollision);
          //составляем список объектов на точках, у которых включена коллизия
          if (objs[0].length > 0 || objs[1].length > 0 || objs[2].length > 0) {
            //если в одном из них есть объект, мы останавливаем объект по оси X
            let collisionObjects=new Array();
            for(let bigInit=0; bigInit<3; bigInit++){
              for(let init=0; init<objs[bigInit].length; init++){
                if(collisionObjects.indexOf(objs[bigInit][init])==-1){
                    collisionObjects.push(objs[bigInit][init]);
                }
              }
            }
            renderer.objects[drawbleObjects[i]].onCollision(collisionObjects);
            renderer.objects[drawbleObjects[i]].x -= renderer.objects[drawbleObjects[i]].speedX;
            renderer.objects[drawbleObjects[i]].speedX = 0;
            renderer.objects[drawbleObjects[i]].accelerationX = 0;
          }
        }

        if (renderer.objects[drawbleObjects[i]].speedX < 0) {
          //если объект двигается влево
          let dots = [];
          dots[0] = new Dot(renderer.objects[drawbleObjects[i]].x-1, renderer.objects[drawbleObjects[i]].y);
          dots[1] = new Dot(renderer.objects[drawbleObjects[i]].x-1, renderer.objects[drawbleObjects[i]].y + renderer.objects[drawbleObjects[i]].height / 2);
          dots[2] = new Dot(renderer.objects[drawbleObjects[i]].x-1, renderer.objects[drawbleObjects[i]].y + renderer.objects[drawbleObjects[i]].height-4);
          //...создаём 3 точки коллизии(на правой грани объекта)
          let countbleObjects = renderer.countDrawbleObjects(this.selectedCam);
          //получаем список объектов в поле зрения
          let objectsWithCollision = [];
          //создаём массив объектов с включенной коллизией
          for (let i = 0; i < countbleObjects.length; i++) {
            //проходимся по всем объектам в поле зрения
            if (renderer.objects[countbleObjects[i]].collision) { //снова 0 или false?
              //и ищем те, у которых включена коллизия
              objectsWithCollision.push(countbleObjects[i]);
            }
          }
          let objs = [];
          objs[0] = renderer.getDotObjects(dots[0], renderer, objectsWithCollision);
          objs[1] = renderer.getDotObjects(dots[1], renderer, objectsWithCollision);
          objs[2] = renderer.getDotObjects(dots[2], renderer, objectsWithCollision);
          //составляем список объектов на точках, у которых включена коллизия
          if (objs[0].length > 0 || objs[1].length > 0 || objs[2].length > 0) {
            //если в одном из них есть объект, мы останавливаем объект по оси X
            let collisionObjects=new Array();
            for(let bigInit=0; bigInit<3; bigInit++){
              for(let init=0; init<objs[bigInit].length; init++){
                if(collisionObjects.indexOf(objs[bigInit][init])==-1){
                    collisionObjects.push(objs[bigInit][init]);
                }
              }
            }
            renderer.objects[drawbleObjects[i]].onCollision(collisionObjects);
            renderer.objects[drawbleObjects[i]].x -= renderer.objects[drawbleObjects[i]].speedX;
            renderer.objects[drawbleObjects[i]].speedX = 0;
            renderer.objects[drawbleObjects[i]].accelerationX = 0;  //снова тоже что и было?
          }
        }

        if (renderer.objects[drawbleObjects[i]].speedY > 0) {
          //если объект двигается вниз...
          let dots = [];
          dots[0] = new Dot(renderer.objects[drawbleObjects[i]].x+2, renderer.objects[drawbleObjects[i]].y + renderer.objects[drawbleObjects[i]].height+1);
          dots[1] = new Dot(renderer.objects[drawbleObjects[i]].x + renderer.objects[drawbleObjects[i]].width/2, renderer.objects[drawbleObjects[i]].y + renderer.objects[drawbleObjects[i]].height+1); //возьми в скобки выражение, а то не ясно что должно делиться на 2
          dots[2] = new Dot(renderer.objects[drawbleObjects[i]].x-2 + renderer.objects[drawbleObjects[i]].width, renderer.objects[drawbleObjects[i]].y + renderer.objects[drawbleObjects[i]].height+1);
          //...создаём 3 точки коллизии(на нижней грани объекта)
          let countbleObjects = renderer.countDrawbleObjects(this.selectedCam);
          //получаем список объектов в поле зрения
          let objectsWithCollision = [];
          //создаём массив объектов с включенной коллизией
          for (let i = 0; i < countbleObjects.length; i++) {
            //проходимся по всем объектам в поле зрения
            if (renderer.objects[countbleObjects[i]].collision) { //снова 0
              //и ищем те, у которых включена коллизия
              objectsWithCollision.push(countbleObjects[i]);
            }
          }
          let objs = [];
          for(let init=0; init<3; init++){
            objs[init] = renderer.getDotObjects(dots[init], renderer, objectsWithCollision);
          }
          //составляем список объектов на точках, у которых включена коллизия
          if (objs[0].length > 0 || objs[1].length > 0 || objs[2].length > 0) {
            //если в одном из них есть объект, мы останавливаем объект по оси Y
            let collisionObjects=new Array();
            for(let bigInit=0; bigInit<3; bigInit++){
              for(let init=0; init<objs[bigInit].length; init++){
                if(collisionObjects.indexOf(objs[bigInit][init])==-1){
                    collisionObjects.push(objs[bigInit][init]);
                }
              }
            }
            renderer.objects[drawbleObjects[i]].onCollision(collisionObjects);
            renderer.objects[drawbleObjects[i]].y-=renderer.objects[drawbleObjects[i]].speedY;
            renderer.objects[drawbleObjects[i]].speedY = 0;
            renderer.objects[drawbleObjects[i]].accelerationY = 0;
          }
        }

        if (renderer.objects[drawbleObjects[i]].speedY < 0) {
          //если объект двигается вверх
          let dots = [];
          dots[0] = new Dot(renderer.objects[drawbleObjects[i]].x, renderer.objects[drawbleObjects[i]].y-1);
          dots[1] = new Dot(renderer.objects[drawbleObjects[i]].x + renderer.objects[drawbleObjects[i]].width /2, renderer.objects[drawbleObjects[i]].y-1); //опять выражение в скобки
          dots[2] = new Dot(renderer.objects[drawbleObjects[i]].x + renderer.objects[drawbleObjects[i]].width, renderer.objects[drawbleObjects[i]].y-1);
          //...создаём 3 точки коллизии(на правой грани объекта)
          let countbleObjects = renderer.countDrawbleObjects(this.selectedCam);
          //получаем список объектов в поле зрения
          let objectsWithCollision = [];
          //создаём массив объектов с включенной коллизией
          for (let i = 0; i < countbleObjects.length; i++) {
            //проходимся по всем объектам в поле зрения
            if (renderer.objects[countbleObjects[i]].collision) { //0
              //и ищем те, у которых включена коллизия
              objectsWithCollision.push(countbleObjects[i]);
            }
          }
          let objs = [];
          objs[0] = renderer.getDotObjects(dots[0], renderer, objectsWithCollision);
          objs[1] = renderer.getDotObjects(dots[1], renderer, objectsWithCollision);
          objs[2] = renderer.getDotObjects(dots[2], renderer, objectsWithCollision); //может цикл?
          //составляем список объектов на точках, у которых включена коллизия
          if (objs[0].length > 0 || objs[1].length > 0 || objs[2].length > 0) {
            //если в одном из них есть объект, мы останавливаем объект по оси X
            let collisionObjects=new Array();
            for(let bigInit=0; bigInit<3; bigInit++){
              for(let init=0; init<objs[bigInit].length; init++){
                if(collisionObjects.indexOf(objs[bigInit][init])==-1){
                    collisionObjects.push(objs[bigInit][init]);
                }
              }
            }
            renderer.objects[drawbleObjects[i]].onCollision(collisionObjects);
            renderer.objects[drawbleObjects[i]].speedY = 0;
            renderer.objects[drawbleObjects[i]].accelerationY = 0;
          }
        }

      }
      let x = renderer.objects[drawbleObjects[i]].x - this.cams[this.selectedCam].x;
      let y = renderer.objects[drawbleObjects[i]].y - this.cams[this.selectedCam].y;
      renderer.objects[drawbleObjects[i]].y += renderer.objects[drawbleObjects[i]].speedY;
      if(renderer.objects[drawbleObjects[i]].speedX > renderer.objects[drawbleObjects[i]].maxSpeed){
        renderer.objects[drawbleObjects[i]].speedX = renderer.objects[drawbleObjects[i]].maxSpeed;
        renderer.objects[drawbleObjects[i]].accelerationX=0;
      }
      if(renderer.objects[drawbleObjects[i]].speedX < 0-renderer.objects[drawbleObjects[i]].maxSpeed){
        renderer.objects[drawbleObjects[i]].speedX = 0-renderer.objects[drawbleObjects[i]].maxSpeed;
        renderer.objects[drawbleObjects[i]].accelerationX=0;
      }
      renderer.objects[drawbleObjects[i]].x += renderer.objects[drawbleObjects[i]].speedX;
      renderer.objects[drawbleObjects[i]].draw(ctx, x, y);
    }
  }
}

class GameObject { //почему они в коде после его выполнения?
  constructor(x, y, width, height, texture, animated, physics, collision, maxSpeed) {
    this.x = x;
    this.y = y;
    //координаты объекта
    this.width = width;
    this.height = height;
    //ширина и высота
    this.collider=new BoxCollider(0, 0, width, height);
    //создаём стандартный коллайдер объекта
    this.physics = physics;
    //булево значение, определяет, действует-ли гравитация на объект
    this.collision = collision;
    //булево значение, включает и выключает коллизию
    this.maxSpeed=maxSpeed;
    this.anims = [];
    this.texture = new Image();
    this.texture.src=texture;
    //аргумент texture содержит в себе текстовое значение(путь к спрайту)
    this.animated = animated;
    //булево значение, определяющее, имеет объект анимации или нет
    //если false, то отрисовывается всегда картинка из anims['default']
    this.anim = 'default';
    this.frame = 0;
    //кадр анимации
    this.drawble = true;
    this.speedX = 0;
    this.speedY = 0;
    this.accelerationX = 0;
    this.accelerationY = 0;
    this.hzObj=0;
    //вспомогательное свойство для анимации
  }

  setCollider(collider){
    this.collider=collider;
  }

  addAnimation(animation) {
    //аргумент animation принимает объект анимации
    this.anims[animation.name] = animation;
  }

  setAnimation(animation){
    //название анимации
    this.anim=animation;
    this.hzObj=0;
    this.frame=0;
  }

  draw(ctx, x, y) {
    if(this.animated){
        if(this.anims[this.anim].hz==0){
          this.texture=this.anims[this.anim].images[0];
        }else{
          this.hzObj++;
          if(this.hzObj>=this.anims[this.anim].hz){
            this.hzObj=0;
            this.frame++;
            if(this.frame==this.anims[this.anim].frames){
              this.frame=0;
            }
            this.texture=this.anims[this.anim].images[this.frame];
          }
        }
    }
    ctx.beginPath();
    ctx.drawImage(this.texture, x, y, this.width, this.height);
    ctx.closePath();
  }

  onCollision(objects){
    return 0;
  }
}

class Animation {
  constructor(name, frames, path, hz) {
    this.name = name;
    //название анимации
    this.frames = frames;
    //колличество кадров
    this.hz=hz;
    //Промежуток fps между сменой кадров
    this.images = [];

    //массив изображений
    //условно договариваемся, что в папке path спрайты называются 0, 1, 2...
    //и они имеют расширение .png

    for (let i = 0; i < frames; i++) {
      this.images[i] = new Image();
      this.images[i].src = path + i +".png";
    }
    //загружаем все файлы через цикл
  }
}

class Camera {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    //x и y верхнего правого угла камеры
    this.width = width;
    this.height = height;
    //ширина и высота изображения
    //объекты, не попадающие на камеру, не отрисовываются
  }
}

class Dot {
  constructor(x, y) {
    this.x = x;
    this.y = y; //у тебя почти везде задействованы x y со значениеями x y :^)
  }
}

class BoxCollider {
  constructor(offset_x, offset_y, width, height){
    this.offset_x=offset_x;
    this.offset_y=offset_y;
    this.width=width;
    this.height=height;
    this.type="boxCollider";
  }
}

console.log('complete');
