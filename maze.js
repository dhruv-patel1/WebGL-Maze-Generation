"use strict";

//Author: Dhruv Patel 
//NetID: dnp78
//Due: 3/07/2021

var canvas;
var gl;
var program;

var cells, visitedCells, n, m;
var startX, startY, endX, endY;
var downSize;

var startX, startY, endX, endY;
var mouseX, mouseY;
var complete = false;

var points = [];


window.onload = function init()
{
    canvas =  document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if(!gl){alert("WebGL 2.0 isn't available");}

    //add eventlistener
    document.onkeydown = function(e){
        switch(e.key){
            case 'ArrowUp':
                moveMouse(e.key);
                up();
                generateMaze(cells, n, m);
                break;
            case 'ArrowDown':
                moveMouse(e.key);
                down();
                generateMaze(cells, n, m);
                break;
            case 'ArrowLeft':
                moveMouse(e.key);
                left();
                generateMaze(cells, n, m);
                break;
            case 'ArrowRight':
                moveMouse(e.key);
                right();
                generateMaze(cells, n, m);
                break;
        }
    }

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(program);

}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, points.length);
    if(complete){
        document.getElementById('alert').innerHTML = "Congrats, You Won!";
        setTimeout(function(){
            window.location.reload()
        }, 5000);
    }

}

function generateMaze(cells, n, m)
{
    for(var x=0; x<n; x++){
        for(var y=0; y<m; y++){
            var currCellArr = cells[x][y];
            if(currCellArr[0] === 1){
                points.push(vec2(downSize * x-0.95, downSize * y-0.95));
                points.push(vec2(downSize * (x+1)-0.95, downSize * y-0.95));
            }
            if(currCellArr[1] === 1){
                points.push(vec2(downSize * (x+1)-0.95, downSize * y-0.95));
                points.push(vec2(downSize * (x+1)-0.95, downSize * (y+1)-0.95));
            }
            if(currCellArr[2] === 1){
                points.push(vec2(downSize * x-0.95, downSize * (y+1)-0.95));
                points.push(vec2(downSize * (x+1)-0.95, downSize * (y+1)-0.95));
            }
            if(currCellArr[3] === 1){
                points.push(vec2(downSize * x-0.95, downSize * y-0.95));
                points.push(vec2(downSize * x-0.95, downSize * (y+1)-0.95));
            }
        }
    }

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    render();
}

function setArrayVal(arr, idx)
{
    for(var i=0; i<arr.length; i++){
        if(i === idx){
            arr[i] = 0;
        }
    }
    return arr;
}


//This function works to generate maze in 2d array
function visitCells(cells, visitedCells, x, y)
{
    //starting cell: cells[x][y]
    //[1,1,1,1]
    visitedCells[x][y] = true;
    var options = [0,1,2,3];

    for(var i=0; i < 4; i++){
        //Randomly choose one of the cases
        //See if it meets condition
            //True: it will visit next cell
            //False: remove option and check another case 
        var randOp = Math.floor(Math.random()*options.length);
        options.splice(randOp,1);
        switch(randOp){
            //check if the cell to the right from current is visited
            case 0:
                if(x < n-1 && visitedCells[x+1][y] === false)
                {
                    cells[x][y] = setArrayVal(cells[x][y], 1);
                    cells[x+1][y] = setArrayVal(cells[x+1][y], 3);
                    visitCells(cells, visitedCells, x+1, y);
                }
            //check if the cell above the current is visited
            case 1:
                if(y < m-1 && visitedCells[x][y+1] === false){
                    cells[x][y] = setArrayVal(cells[x][y], 2);
                    cells[x][y+1] = setArrayVal(cells[x][y+1], 0);
                    visitCells(cells, visitedCells, x, y+1);
                }
            //check if the cell to the left of the current is visited
            case 2:
                if(x > 0 && visitedCells[x-1][y] === false){
                    cells[x][y] = setArrayVal(cells[x][y], 3);
                    cells[x-1][y] = setArrayVal(cells[x-1][y], 1);
                    visitCells(cells, visitedCells, x-1, y);
                }
            //check if the cell below of the current is visited
            case 3:
                if(y > 0 && visitedCells[x][y-1] === false){
                    cells[x][y] = setArrayVal(cells[x][y], 0);
                    cells[x][y-1] = setArrayVal(cells[x][y-1], 2);
                    visitCells(cells, visitedCells, x, y-1);
                }
        }
    }

}

function genStartEnd(cells)
{
  //want to manipulate top and bottom row of cells
  //for top, want to remove one of the top edges 
  //for bottom, want to remove one of the bottom edges
    startX = Math.floor(Math.random() * n);
    startY = Math.floor(Math.random() * m);
    endX = Math.floor(Math.random() * n);
    endY = Math.floor(Math.random() * m);

    var t = Math.floor(Math.random() * 2);

    if(startX != 0 && startX != n)
    {
        if(t){
            startY = 0;
            endY = m-1;
        }
        else{
            startY = m-1;
            endY = 0;
        } 
    }

    if(startX == 0){
        endX = n-1;
        cells[startX][startY] = setArrayVal(cells[startX][startY], 3);
        cells[endX][endY] = setArrayVal(cells[endX][endY], 1);
    }
    if(startX == n-1){
        endX = 0;
        cells[startX][startX] = setArrayVal(cells[startX][startY], 1);
        cells[endX][endY] = setArrayVal(cells[endX][endY], 3);
    }
    if(startY == 0){
        cells[startX][startX] = setArrayVal(cells[startX][startY], 0);
        cells[endX][endY] = setArrayVal(cells[endX][endY], 2);
    }
    if(startY == m-1){
        cells[startX][startX] = setArrayVal(cells[startX][startY], 2);
        cells[endX][endY] = setArrayVal(cells[endX][endY], 0);
    }

    mouseX = startX;
    mouseY = startY;

}

function initializeMaze()
{
    points.length = 0;
    cells = [];
    visitedCells = [];
    //get elements from user input
    n = document.getElementById("n").value;
    m = document.getElementById("m").value;

    //use scaling function to downsize maze dimensions
    var max = Math.max(n,m);
    var sd = Math.ceil(max / 10);
    downSize = 0.1/sd;
    downSize = downSize * 1.8;

    //initialize basic dimensions of maze cells
    //populate arrays with dummy basic values
    for(var i=0; i<n; i++){
        cells[i] = [];
        visitedCells[i] = [];

        for(var j=0; j<m; j++){
            cells[i][j] = [1,1,1,1];
            visitedCells[i][j] = false;
        }
    }

    //get random start position based on maze dimensions
    var x = Math.floor(Math.random() * n);
    var y = Math.floor(Math.random() * m);

    visitCells(cells, visitedCells, x, y);
    //cells values are updated with the visitCells()
    //check console log and see how I would go about fixing the perimeter to be enclosed
    //Then do the logic for creating the entrance and the exit
    console.log(cells);

    //add logic for creating entrace and exit randomly
    //also close any gaps on the perimeter of the maze
    genStartEnd(cells);

    up();
    //once maze is completely done
    //pass maze and dimensions to draw Function to push points into points array
    generateMaze(cells, n, m);


    
}

//have to implement rat controls and movement

function right()
{
    points.length = 0;
    points.push(vec2(mouseX* downSize + 0.15*downSize-0.95, mouseY * downSize + 0.75*downSize-0.95));
    points.push(vec2(mouseX * downSize + 0.95*downSize-0.95, mouseY * downSize + 0.5*downSize-0.95));
    points.push(vec2(mouseX * downSize + 0.95*downSize-0.95, mouseY * downSize + 0.5*downSize-0.95));
    points.push(vec2(mouseX * downSize + 0.15*downSize-0.95, mouseY * downSize + 0.25*downSize-0.95));
}

function left()
{
    points.length = 0;
    points.push(vec2(mouseX* downSize + 0.75*downSize-0.95, mouseY * downSize + 0.75*downSize-0.95));
    points.push(vec2(mouseX * downSize + 0.05*downSize-0.95, mouseY * downSize + 0.5*downSize-0.95));
    points.push(vec2(mouseX * downSize + 0.05*downSize-0.95, mouseY * downSize + 0.5*downSize-0.95));
    points.push(vec2(mouseX * downSize + 0.75*downSize-0.95, mouseY * downSize + 0.25*downSize-0.95));
}

function down()
{
    points.length = 0;
    points.push(vec2(mouseX* downSize + 0.75*downSize-0.95, mouseY * downSize + 0.75*downSize-0.95));
    points.push(vec2(mouseX * downSize + 0.5*downSize-0.95, mouseY * downSize + 0.05*downSize-0.95));
    points.push(vec2(mouseX * downSize + 0.5*downSize-0.95, mouseY * downSize + 0.05*downSize-0.95));
    points.push(vec2(mouseX * downSize + 0.25*downSize-0.95, mouseY * downSize + 0.75*downSize-0.95));
}

function up()
{
    points.length = 0;
    points.push(vec2(mouseX* downSize + 0.25*downSize-0.95, mouseY * downSize + 0.25*downSize-0.95));
    points.push(vec2(mouseX * downSize + 0.5*downSize-0.95, mouseY * downSize + 0.95*downSize-0.95));
    points.push(vec2(mouseX * downSize + 0.5*downSize-0.95, mouseY * downSize + 0.95*downSize-0.95));
    points.push(vec2(mouseX * downSize + 0.75*downSize-0.95, mouseY * downSize + 0.25*downSize-0.95));
}


function moveMouse(direction){
    if(direction == 'ArrowUp' && mouseY < m-1 && cells[mouseX][mouseY][2] == 0){
        mouseY++;
        up();
    }
    if(direction == 'ArrowDown' && mouseY > 0 && cells[mouseX][mouseY][0] == 0){
        mouseY--;
        down();
    }
    if(direction == 'ArrowLeft' && mouseX > 0 && cells[mouseX][mouseY][3] == 0){
        mouseX--;
        left();
    }
    if(direction == 'ArrowRight' && mouseX < n-1 && cells[mouseX][mouseY][1] == 0){
        mouseX++;
        right();
    }
    if(mouseX == endX && mouseY == endY){
        complete = true;
    }


}