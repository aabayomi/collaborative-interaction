document.addEventListener('DOMContentLoaded', () => {

    var socket = io();
    var canvas = document.getElementById('myCanvas');
    const cxt = canvas.getContext('2d');
    const userCountEl = document.getElementById('userCount');
   
    paper.install(window);
    paper.setup(canvas);
  
    var current = {
        color: 'black',
        x: 0,
        y: 0,
    };

    var drawing = false;  
    socket.on('drawing', drawEvent);

    socket.on('clearCanvas', () => {
        paper.project.activeLayer.removeChildren(); 
        paper.view.update(); 
    });

  
    function draw(x0, y0, x1, y1, color, emit) {
        cxt.beginPath();
        cxt.moveTo(x0, y0);
        cxt.lineTo(x1, y1);
        cxt.strokeStyle = color;
        cxt.lineWidth = 2;
        cxt.stroke();
        cxt.closePath();
  
        if (!emit) { return; }
        var w = canvas.width;
        var h = canvas.height;
  
        socket.emit('drawing', {
            x0: x0 / w,
            y0: y0 / h,
            x1: x1 / w,
            y1: y1 / h,
            color: color
        });
    }
  
    const tool = new Tool();

    tool.onMouseDown = (e) => {
        drawing = true;
        start = e.point;
        current.x = e.point.x;
        current.y = e.point.y;
        current.color = tool.strokeColor; 
    }
  
    tool.onMouseUp = (e) =>{
        if (!drawing) { return; }
        drawing = false;
        draw(current.x, current.y, e.point.x, e.point.y, current.color, true);
        current.x = 0;
        current.y = 0;
        
    }
  
    tool.onMouseMove = (e) => {
        if (!drawing) { return; }
        draw(current.x, current.y,e.point.x, e.point.y, current.color, true);
        current.x = e.point.x; 
        current.y = e.point.y; 
    }
  
    function drawEvent(data) {
        var w = canvas.width;
        var h = canvas.height;
        draw(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    }
  

    document.getElementById('clearButton').addEventListener('click', () => {
        socket.emit('clearCanvas');
        cxt.clearRect(0, 0, canvas.width, canvas.height);
        paper.project.activeLayer.removeChildren(); 
        paper.view.update(); 
    });

    document.querySelectorAll('.colorOption').forEach((colorOption) => {
        colorOption.addEventListener('click', () => {
            const selectedColor = colorOption.getAttribute('data-color');
            socket.emit('colorSelected', selectedColor);
            document.getElementById('colorBox').style.backgroundColor = selectedColor;
            tool.strokeColor = selectedColor;
            document.getElementById('userColor').querySelector('span').textContent = selectedColor;
            document.getElementById('userColor').querySelector('span').style.color = selectedColor;
        });
        
    });

    socket.on('assignedColor', (color) => {
        document.getElementById('userColor').querySelector('span').textContent = color;
        document.getElementById('userColor').querySelector('span').style.color = color;
    });


    socket.on('updateUserCount', (count) => {
        userCountEl.textContent = `Users connected: ${count}`;
    });
  
});