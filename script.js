let cells = document.querySelectorAll(".wrapper > .grid > div > span");
let toggleButton = document.querySelector('#toggle-button');
let grid = [];
let dp = new Map();
let userSelect;
let turn;
let prevent = false;

toggleButton.addEventListener("click", function () {
  let sheet = document.styleSheets[1];
  if (toggleButton.checked) {
    sheet.cssRules[1].style.setProperty("--back-color", "#212121");
    sheet.cssRules[1].style.setProperty("--color", "#c39a3b");
    sheet.cssRules[1].style.setProperty("--filter1", "invert(1%) sepia(14%) saturate(53%) hue-rotate(314deg) brightness(107%) contrast(76%)");
    sheet.cssRules[1].style.setProperty("--filter2", "invert(60%) sepia(64%) saturate(377%) hue-rotate(4deg) brightness(90%) contrast(101%)");
  }
  else {
    sheet.cssRules[1].style.setProperty("--back-color", "#fafafa");
    sheet.cssRules[1].style.setProperty("--color", "#6125f9");
    sheet.cssRules[1].style.setProperty("--filter1", "invert(100%) sepia(57%) saturate(1%) hue-rotate(286deg) brightness(110%) contrast(96%)");
    sheet.cssRules[1].style.setProperty("--filter2", "invert(18%) sepia(79%) saturate(6544%) hue-rotate(258deg) brightness(96%) contrast(103%)");
  }
})

choose();
preprocess(0);

function draw(grid) {
  for (let i = 0; i < 9; i++) {
    if (grid[i] === 'o')
      cells[i].innerHTML = `<img src="o-solid.svg">`;
    else if (grid[i] === 'x')
      cells[i].innerHTML = `<img src="x-solid.svg">`;
    else
      cells[i].innerHTML = ' ';
  }
}

function reset() {
  for(let cell of cells)
    cell.innerHTML = ' ';
  prevent = false;
  choose();
}

function losing (type, grid) {
  for(let i=0;i<9;i++) {
    if(grid[i] === ' ') {
      if(type === 'x')
        grid[i] = 'o';
      else
        grid[i] = 'x';
      let aux = winning([...grid]);
      grid[i] = ' ';
      if(type === 'x' && aux === -1)
        return true;
      if(type === 'o' && aux === 1)
        return true;
    }
  }
  return false;
}

function get() {
  let grid = [];
  for (let i = 0; i < 9; i++) {
    if (cells[i].innerHTML === `<img src="o-solid.svg">`)
      grid[i] = 'o';
    else if (cells[i].innerHTML === `<img src="x-solid.svg">`)
      grid[i] = 'x';
    else
      grid[i] = ' ';
  }
  return grid;
}

function empty(grid) {
  for(let cell of grid)
    if(cell === ' ')
      return true;
  return false;
}

function play() {
  let grid = get();
  let winner = winning(grid)
  if(winner || !empty(grid)) {
    if(winner === userSelect)
      show(1);
    else if(winner && winner != userSelect)
      show(0);
    else
      show();
    return;
  }
  if (turn === 1 && userSelect === -1) {
    let ans;
    let aux = -200;
    let already = false;
    for (let i = 0; i < 9; i++) {
      if (grid[i] === ' ') {
        grid[i] = 'x';
        if(!already) {
          ans = [...grid];
          aux = dp[ans];
          already = true;
        }
        else if (dp[grid] > aux && !losing('x', grid) || losing('x', ans)) {
          ans = [...grid];
          aux = dp[ans];
        }
        if(winning(grid) === 1) {
          ans = [...grid];
          break;
        }
        grid[i] = ' ';
      }
    }
    draw(ans);
    turn = -1;
    grid = get();
    let winner = winning(grid)
    if(winner || !empty(grid)) {
      if(winner === userSelect)
        show(1);
      else if(winner && winner != userSelect)
        show(0);
      else
        show();
      return;
    }
  }
  else if (turn === -1 && userSelect === 1) {
    let ans;
    let aux = 200;
    let already = false;
    for (let i = 0; i < 9; i++) {
      if (grid[i] === ' ') {
        grid[i] = 'o';
        if(!already) {
          ans = [...grid];
          aux = dp[ans];
          already = true;
        }
        else if (dp[grid] < aux && !losing('o', grid) || losing('o', ans)) {
          ans = [...grid];
          aux = dp[ans];
        }
        if(winning(grid) === -1) {
          ans = [...grid];
          break;
        }
        grid[i] = ' ';
      }
    }
    draw(ans);
    turn = 1;
    grid = get();
    let winner = winning(grid)
    if(winner || !empty(grid)) {
      if(winner === userSelect)
        show(1);
      else if(winner && winner != userSelect)
        show(0);
      else
        show();
      return;
    }
  }
}

function choose() {
  let p = document.createElement("p");
  p.className = "choose";
  p.innerHTML = `<b>Make your choice !</b><div><span><img src="x-solid.svg" class="x"></span><span><img src="o-solid.svg" class="o"></div></span>`;
  document.querySelector("body").prepend(p);
}

function show(winner) {
  let p = document.createElement("p");
  p.className = "pop-up";
  p.innerHTML = `<img src="xmark-solid.svg" class="close">`;
  if (winner != undefined)
    p.innerHTML += `You ${winner ? "win" : "lose"}`;
  else
    p.innerHTML += 'Draw';
  document.querySelector(".wrapper").prepend(p);
  prevent = true;
}

document.addEventListener("click", (e) => {
  if (e.target.className === "o") {
    e.target.parentElement.parentElement.parentElement.remove();
    userSelect = -1;
    turn = 1;
    play()
  }
  else if (e.target.className === "x") {
    userSelect = 1;
    e.target.parentElement.parentElement.parentElement.remove();
    turn = 1;
    play()
  }
  else if (e.target.className === 'close') {
    e.target.parentElement.remove();
    reset();
  }
})

function preprocess(index) {
  if (index === 9) {
    dp[[...grid]] = solve([...grid]);
    return;
  }
  for (let i = 0; i < 3; i++) {
    if (!i) {
      grid[index] = " ";
      preprocess(index + 1);
    }
    if (i === 1) {
      grid[index] = "x";
      preprocess(index + 1);
    }
    if (i === 2) {
      grid[index] = "o";
      preprocess(index + 1);
    }
  }
}

function winning(grid) {
  let arr = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  let o = false;
  for (let i = 0; i < arr.length; i++)
    if (grid[arr[i][0]] === grid[arr[i][1]] && grid[arr[i][1]] === grid[arr[i][2]]) {
      if (grid[arr[i][0]] === 'x') {
        return 1;
      }
      if (grid[arr[i][0]] === 'o') {
        o = true;
      }
    }
  return -o;
}

function valid(grid) {
  let x = 0, o = 0;
  for (let i = 0; i < grid.length; i++) {
    x += grid[i] === 'x';
    o += grid[i] === 'o';
  }
  return x - o < 2 && x >= o;
}

function solve(grid) {
  if (!valid(grid))
    return 0;
  let ans = winning(grid);
  if (ans)
    return ans;
  let aux = 0;
  for (let i = 0; i < 9; i++)
    aux += grid[i] === ' ';
  for (let i = 0; i < 9; i++)
    if (grid[i] === ' ') {
      if (aux % 2)
        grid[i] = 'x';
      else
        grid[i] = 'o';
      ans += solve([...grid]);
      grid[i] = ' ';
    }
  return ans;
}

cells.forEach(function (cell) {
  cell.addEventListener("click", function (e) {
    if (e.target.tagName !== 'IMG' && !prevent) {
      if (userSelect === -1) {
        e.target.innerHTML = `<img src="o-solid.svg">`;
        turn = 1;
        play();
      }
      else {
        e.target.innerHTML = `<img src="x-solid.svg">`;
        turn = -1;
        play();
      }
    }
  })
})