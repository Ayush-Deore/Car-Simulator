const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let startAngle = Math.PI / 2;

let carImg = new Image();
carImg.src = "car_topview.svg";


//road segments declaration
const roadSegments = [{
    type: "straight",
    x: 100,
    y: 150,
    width: 50,
    height: 320
  },
  {
    type: "straight",
    x: 450,
    y: 475,
    width: 100,
    height: 50
  },
  {
    type: "curve",
    cx: 175,
    cy: 150,
    radius: 50,
    startAngle: Math.PI,
    endAngle: Math.PI * 1.5,
  },

  {
    type: "straight",
    x: 160,
    y: 75,
    width: 400,
    height: 50
  },
  {
    type: "curve",
    cx: 550,
    cy: 150,
    radius: 50,
    startAngle: Math.PI * 1.5,
    endAngle: 0,
  },
  {
    type: "curve",
    cx: 550,
    cy: 450,
    radius: 50,
    startAngle: 0,
    endAngle: Math.PI * 0.5,
  },
  {
    type: "straight",
    x: 575,
    y: 150,
    width: 50,
    height: 300
  },
  {
    type: "curve",
    cx: 450,
    cy: 450,
    radius: 50,
    startAngle: Math.PI * 0.5,
    endAngle: Math.PI * 1,
  },

  {
    type: "straight",
    x: 375,
    y: 350,
    width: 50,
    height: 100
  },
  {
    type: "curve",
    cx: 350,
    cy: 350,
    radius: 50,
    startAngle: Math.PI * 1,
    endAngle: Math.PI * 2,
  },
  {
    type: "straight",
    x: 275,
    y: 350,
    width: 50,
    height: 100
  },
  {
    type: "curve",
    cx: 250,
    cy: 450,
    radius: 50,
    startAngle: 0,
    endAngle: Math.PI * 0.5,
  },
  {
    type: "straight",
    x: 100,
    y: 475,
    width: 150,
    height: 50
  },
];


//parking and starting pt declaration
const parkingSpot = {
  x: 100,
  y: 410,
  width: 50,
  height: 60
};
const startPoint = {
  x: 130,
  y: 500
};



//car declaration
const car = {
  x: startPoint.x,
  y: startPoint.y,
  width: 25,
  height: 50,
  angle: startAngle,
  speed: 0,
  maxSpeed: 2,
  acceleration: 0.3,
  friction: 0.02,
  controls: {
    forward: false,
    reverse: false,
    left: false,
    right: false,
    stop: false,
  },
};




//controls declaration
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") car.controls.forward = true;
  if (e.key === "ArrowDown") car.controls.reverse = true;
  if (e.key === "ArrowLeft") car.controls.left = true;
  if (e.key === "ArrowRight") car.controls.right = true;
  if (e.key === " ") car.controls.stop = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp") car.controls.forward = false;
  if (e.key === "ArrowDown") car.controls.reverse = false;
  if (e.key === "ArrowLeft") car.controls.left = false;
  if (e.key === "ArrowRight") car.controls.right = false;
  if (e.key === " ") car.controls.stop = false;
});



//car update method upon keyboard event
function updateCar() {
  if (car.controls.forward) {
    car.speed += car.acceleration;
  }
  if (car.controls.reverse) {
    car.speed -= car.acceleration;
  }
  if (car.controls.stop) {
    car.speed = 0;
  }

  if (car.speed !== 0) {
    const flip = car.speed > 0 ? 1 : -1;
    if (car.controls.left) car.angle -= 0.03 * flip;
    if (car.controls.right) car.angle += 0.03 * flip;
  }

  car.speed *= 1 - car.friction;
  car.speed = Math.max(Math.min(car.speed, car.maxSpeed), -car.maxSpeed / 2);

  car.x += Math.sin(car.angle) * car.speed;
  car.y -= Math.cos(car.angle) * car.speed;
}




//car draw function
function drawCar() {
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);
  ctx.drawImage(carImg, -car.width / 2, -car.height / 2, car.width, car.height);

  ctx.restore();
}



//road draw fucntion
function drawRoad() {
  for (let seg of roadSegments) {
    if (seg.type === "straight") {
      ctx.fillStyle = "#333";
      ctx.fillRect(seg.x, seg.y, seg.width, seg.height);
    } else if (seg.type === "curve") {
      ctx.beginPath();
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 50;
      ctx.arc(seg.cx, seg.cy, seg.radius, seg.startAngle, seg.endAngle);
      ctx.stroke();
    }
  }




  // Draw parking
  ctx.fillStyle = "#fff";
  ctx.fillRect(
    parkingSpot.x,
    parkingSpot.y,
    parkingSpot.width,
    parkingSpot.height
  );
}



//check for car being on road
function isOnRoad() {
  for (let seg of roadSegments) {
    if (seg.type === "straight") {
      if (
        car.x > seg.x &&
        car.x < seg.x + seg.width &&
        car.y > seg.y &&
        car.y < seg.y + seg.height
      ) {
        return true;
      }
    } else if (seg.type === "curve") {
      const dx = car.x - seg.cx;
      const dy = car.y - seg.cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const normAngle = (angle + 2 * Math.PI) % (2 * Math.PI);
      const start = seg.startAngle % (2 * Math.PI);
      const end = seg.endAngle % (2 * Math.PI);

      const inAngleRange =
        start < end ?
        normAngle >= start && normAngle <= end :
        normAngle >= start || normAngle <= end;

      if (dist > seg.radius - 25 && dist < seg.radius + 25 && inAngleRange) {
        return true;
      }
    }
  }
  return false;
}



//checks if car is in the parking spot
function checkParking() {
  return (
    car.x > parkingSpot.x &&
    car.x < parkingSpot.x + parkingSpot.width &&
    car.y > parkingSpot.y &&
    car.y < parkingSpot.y + parkingSpot.height &&
    Math.abs(car.speed) < 0.1
  );
}




function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawRoad();
  updateCar();
  drawCar();

  if (!isOnRoad()) {
    ctx.fillStyle = "#fff";
    ctx.font = "30px sans-serif ";
    ctx.fillText("Car went off the road! Press Ctrl+R to Reset", 100, 50);
    car.speed = speed;
  }

  if (checkParking()) {
    ctx.fillStyle = "lime";
    ctx.font = "30px sans-serif ";
    ctx.fillText("Level Complete!", 220, 200);
    car.speed = speed;
  }

  requestAnimationFrame(animate);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "r") {
    car.x = startPoint.x;
    car.y = startPoint.y;
    car.angle = startAngle;
    car.speed = 0;
  }
});

animate();