//-----------VARIABLES----------------

fruitList = ["apple","grapes","kiwi","lemon",
    "orange","pineapple","raspberry","watermelon"];
gameStatus = "Setup";
currCards = 6;
roundTime = 4;
gameScore = 0;
gameDay = "";
timer = null;
timerHit = false;
chosenOne = "";
fruitRack = [];
countChosen = 0;
lives = 3;

//---------VERY BEGINNING-------------

$(document).ready(setTimeout(()=>{
    if(screen.width < 1073){$('#warningModal').modal({ backdrop: 'static', keyboard: false });}
    else {
        if (localStorage.getItem("gameScore")===null || localStorage.getItem("lives")==="0"){
            $('#startModal').modal({ backdrop: 'static', keyboard: false });
            setTimeout(()=>{
                document.addEventListener('keydown', enterKey);
            },450);
        } else if(localStorage.getItem("gameScore")==="250"){
            congratulate();
            lastGame = localStorage.getItem("gameDay");
            document.getElementById("lastGame-holder").innerHTML = "Played On:&nbsp; <span id='last-game'></span>";
            document.getElementById("last-game").innerText = lastGame;
        } else if(localStorage.getItem("gameScore")!=="0"){ 
            document.getElementById("game-day").innerText = gameDay = localStorage.getItem("gameDay");
            $('#redoModal').modal({ backdrop: 'static', keyboard: false });
            setTimeout(()=>{
                document.addEventListener('keydown', continueKey);
            },450);
        } else if (localStorage.getItem("gameScore")==="0"){
            $('#startModal').modal({ backdrop: 'static', keyboard: false });
            setTimeout(()=>{
                document.addEventListener('keydown', enterKey);
            },450);
        }
    }
},500));

//----------CHEAT PREVENTION----------

function prevCheats(e){
    e.preventDefault();
    if (e.key == "F12"){
        $('#denialModal').modal();
    }
    if(e.metaKey && e.key == "Shift"){
        $('#denialModal').modal();
    }
}

function lockCheats(){document.addEventListener('keydown',prevCheats);}
function unlockCheats(){document.removeEventListener('keydown',prevCheats);}
document.addEventListener('contextmenu',function(e){e.preventDefault();});

//-------CONFIG & UI UPDATING---------

function displayChosenOne(fruit){
    document.getElementById("display").style.backgroundImage = "url(" + fruit + ".png)";
    document.getElementById("display").style.opacity = 1;
}
function revealClcikedCard(num){
    gameDay = makeDate();
    let id = "card" + num.toString();
    let currImg = document.getElementById(id).style.backgroundImage;
    if (currImg.includes("main.jpg")){
        document.body.style.pointerEvents = "none";
        let fruit = fruitRack[num-1];
        turnCard(id,(fruit + ".png"));
        if(fruit===chosenOne){rightChoice();}
        else if(fruit!==chosenOne){setTimeout(()=>{wrongChoice(1);},500);}
    }
}

function scaleUp(){
    if(nextCard<31){
        let id = "card" + nextCard.toString();
        document.getElementById(id).style.visibility = "visible";
        document.getElementById(id).style.transform = "scale(1) rotateZ(0)";
        nextCard++;
    }
}

function previewCards(fruits){
    lastID = "card" + currCards.toString();
    for (let i=1; i<(fruits.length+1); i++){
        let id = "card" + i.toString();
        let fruit = fruits[i-1] + ".png"
        setTimeout(()=>{
            turnCard(id,fruit);
            if(id===lastID){gameStatus="Counting Down"; return;}
        },i*70);
    }
}

function countDown(){
    currSeconds = roundTime;
    document.getElementById("time").innerHTML = currSeconds;
    document.getElementById("display").style.opacity = 1;
    setTimeout(()=>{document.getElementById("display").style.opacity = 0;},900);
    timer = setInterval(()=>{
        currSeconds--;
        document.getElementById("time").innerHTML = currSeconds;
        document.getElementById("display").style.opacity = 1;
        if (currSeconds === 0){
            clearInterval(timer);
            document.getElementById("time").innerHTML = "&nbsp;";
            gameStatus = "Un-Previewing Cards";
            return;
        }
        setTimeout(()=>{document.getElementById("display").style.opacity = 0;},900);
    },1000);
}

function unPreviewCards(count){
    for (let i=1; i<(count+1); i++){
        let id = "card" + i.toString();
        setTimeout(()=>{unturnCard(id)},i*70);
    }
    setTimeout(()=>{gameStatus = "Displaying Chosen One";},(count+3)*70);
}

function updateHearts(){
    let iden, dur, scale;
    let styleIn = "ease-out";
    let styleOut = "ease-in";
    if (lives===2){
        iden = "heart3"; dur = 250; scale = "1.5";
    } else if (lives===1){
        iden = "heart1"; dur = 250; scale = "1.5"; 
        document.getElementById("heart3").style.transform = "scale(0) rotateZ(0deg)"
    } else if (lives===0){
        iden = "heart2"; dur = 500; scale = "2.5"; styleIn = "ease-out"; styleOut = "ease";
        document.getElementById("heart3").style.transform = "scale(0) rotateZ(0deg)"
        document.getElementById("heart1").style.transform = "scale(0) rotateZ(0deg)"
    }
    document.getElementById(iden).style.transitionTimingFunction = styleIn;
    document.getElementById(iden).style.transform = "scale(" + scale + ") rotateZ(-20deg)"
    setTimeout(()=>{
        document.body.style.backgroundColor = "#cecece";
        document.getElementById(iden).style.transitionTimingFunction = styleOut;
        document.getElementById(iden).style.transform = "scale(0) rotateZ(0deg)"
        if(lives===0){endGame();}
        else{document.body.style.pointerEvents = "all";}
    },dur);
}

function updateScore(){
    document.getElementById("modal-score").innerHTML = gameScore;
    document.getElementById("score").style.opacity = 0;
    setTimeout(()=>{
        document.getElementById("score").innerHTML = gameScore;
        document.getElementById("score").style.opacity = 1;
    },200);
}

function restartUI(){
    document.getElementById("heart1").style.transform = "scale(1)"
    document.getElementById("heart2").style.transform = "scale(1)"
    document.getElementById("heart3").style.transform = "scale(1)"
    for (let i=1; i<(currCards+1); i++){
        let id = "card" + i.toString();
        unturnCard(id);
    }
}

//For adding single new card
function updateCards(){
    if(currCards<30){
        let id = "card" + currCards.toString();
        document.getElementById(id).style.visibility = "visible";
        document.getElementById(id).style.transform = "scale(1) rotateZ(0)";
    }
}

//For restoring the added cards
function updateCardsPrev(diff){
    for(let i=1; i<(diff+1); i++){
        if(currCards<30){
            num = i+6;
            let id = "card" + num.toString();
            document.getElementById(id).style.visibility = "visible";
            document.getElementById(id).style.transform = "scale(1) rotateZ(0)";
        }
    }
}

function congratulate(){
    $('#finishModal').modal({ backdrop: 'static', keyboard: false });
    document.addEventListener('keydown', function(e){
        if(e.key==="Enter"){
            localStorage.clear();
            location.reload();
        } else if (e.key==="Escape"){
            window.close();
        }
    });
}

//----------SMALL FUNCTIONS-----------

function removeAddedCards(){
    for (let i=7; i<31; i++){
        let id = "card" + i.toString();
        document.getElementById(id).style.visibility = "hidden";
        document.getElementById(id).style.transform = "scale(0) rotateZ(20deg)";
    }
}

function continueKey(e){
    if (e.key==="Escape"){redoGame();}
    else if (e.key==="Enter"){continueGame();}
}

function tryAgain(){
    localStorage.clear();
    location.reload();
}

function retryKey(e){
    if (e.key==="Enter"){tryAgain()}
}

function enterKey(e){
    if (e.key==="Enter"){startGame(); lockCheats();}
}

function enterContinue(e){
    if (e.key==="Enter"){continueGame(); lockCheats();}
}

function readRules(e){
    if(e.key==="r" || e.key==="R"){
        $('#rulesModal').modal();
        document.addEventListener('keydown', function(e){
            if(e.key==="Enter"){$('#rulesModal').modal('hide');}
        });
    }
}
function closeRules(){$('#rulesModal').modal('hide');}

//---------HELPING FUNCTIONS----------

function countFruits(arr,fruit){
    let count = arr.filter(x => x === fruit).length;
    return count;
}

function makeDate(){
    return new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function turnCard(id,fruit){
    document.getElementById(id).style.transform = "scaleX(-1) rotateY(180deg)";
    setTimeout(function(){
        document.getElementById(id).style.boxShadow = "3px 3px 3px #0000004d";
        document.getElementById(id).style.backgroundImage = "url(" + fruit + ")";
    },90);
}

function unturnCard(id){
    document.getElementById(id).style.transform = "scaleX(1) rotateY(360deg)";
    setTimeout(function(){
        document.getElementById(id).style.boxShadow = "3px 3px 3px #0000004d";
        document.getElementById(id).style.backgroundImage = "url('main.jpg')";
    },90);
}

//--------START/END/REDO/MORE---------

function startGame(e){
    gameDay = makeDate();
    localStorage.setItem("gameDay",gameDay);
    localStorage.setItem("gameScore",0);
    localStorage.setItem("roundTime",4);
    localStorage.setItem("currCards",6);
    localStorage.setItem("lives",3);
    fruitRack = [];
    document.removeEventListener('keydown', enterKey);
    gameStatus = "Begun";
    lockCheats();
    timerHit = false;
    timer = null;
    document.body.style.pointerEvents = "none";
    $('#startModal').modal('hide');
    setTimeout(()=>{
        document.addEventListener('keydown', readRules);
        processRound();
    },1000);
}

//After each round
function refreshGame(){
    countChosen = 0;
    fruitRack = [];
    gameDay = makeDate();
    timer = null;
    timerHit = false;
    localStorage.setItem("gameDay",gameDay);
    localStorage.setItem("gameScore",gameScore);
    localStorage.setItem("lives",lives);
    if(gameScore===250){
        document.removeEventListener('keydown',readRules);
        unlockCheats(); congratulate(); return;
    }
    if (gameScore%10===0){
        roundTime+=1;
        currCards+=1;
        updateCards();
    }
    localStorage.setItem("roundTime",roundTime);
    localStorage.setItem("currCards",currCards);
    processRound();
}

//Redo Modal
function continueGame(){
    gameScore = parseInt(localStorage.getItem("gameScore"));
    roundTime = parseInt(localStorage.getItem("roundTime"));
    currCards = parseInt(localStorage.getItem("currCards"));
    fruitRack = localStorage.getItem("fruitRack").split(",");
    chosenOne = localStorage.getItem("chosenOne");
    lives = parseInt(localStorage.getItem("lives"));
    timer = null;
    timerHit = false;
    diff = currCards - 6;
    if(diff>0){updateCardsPrev(diff)}
    if(lives<3){updateHearts();}
    updateScore();
    $('#redoModal').modal('hide');
    lockCheats();
    setTimeout(()=>{
        document.addEventListener('keydown', readRules);
        processRound();
    },1000);
}
function redoGame(){
    localStorage.clear();
    $('#redoModal').modal('hide');
    $('#overModal').modal('hide');
    gameStatus = "Setup";
    timer = null;
    currCards = 6;
    roundTime = 4;
    gameScore = 0;
    gameDay = "";
    fruitRack = [];
    chosenOne = "";
    countChosen = 0;
    lives = 3;
    startGame();
}

function endGame(){
    setTimeout(()=>{
        fruitRack = [];
        document.getElementById("display").style.backgroundImage = "";
        $('#overModal').modal({ backdrop: 'static', keyboard: false });
        setTimeout(()=>{
            document.removeEventListener('keydown', readRules);
            document.addEventListener('keydown', retryKey);
        },450);
    },500);
}

//---------DECISION FUNCTIONS---------

function wrongChoice(times){
    document.body.style.backgroundColor = "#ffc0cb";
    lives--;
    updateHearts();
}

function rightChoice(){
    countChosen = countChosen - 1;
    if (countChosen === 0) {
        gameScore++;
        localStorage.setItem("gameScore",gameScore);
        document.body.style.backgroundColor = "#7cff7c";
        setTimeout(()=>{
         for (let i=1; i<(fruitRack.length+1); i++){
                let id = "card" + i.toString();
                let currImg = document.getElementById(id).style.backgroundImage;
                if(currImg.includes("main.jpg")){
                    let fruit = fruitRack[i-1] + ".png";
                    turnCard(id,fruit);
                }
            }
        },400);
        setTimeout(()=>{
            updateScore();
            document.getElementById("display").style.opacity = 0;
            document.body.style.backgroundColor = "#cecece";
            for (let i=1; i<(fruitRack.length+1); i++){
                let id = "card" + i.toString();
                unturnCard(id);
            }
        },1400);
        setTimeout(()=>{
            document.getElementById("display").style.backgroundImage = "";
            refreshGame();
        },2000)
    } else {
        document.body.style.pointerEvents = "all";
    }
}

//--------PROCEDURAL FUNCTIONS--------

function chooseCards(){
    if(fruitRack.length === 0){
        fruitRack = new Array(currCards).fill("");
        for (i in fruitRack){
            let element = fruitList[Math.floor(Math.random()*(fruitList.length))];
            fruitRack[i] = element;
        }
        chosenFruits = [...new Set(fruitRack)];
        chosenOne = chosenFruits[Math.floor(Math.random()*(chosenFruits.length))];
        localStorage.setItem("fruitRack",fruitRack);
        localStorage.setItem("chosenOne",chosenOne);
    }
    countChosen = countFruits(fruitRack, chosenOne);
    gameStatus = "Displaying Cards";
}

function processRound(){
    document.body.style.pointerEvents = "none";
    timerHit = false;
    gameStatus = "Choosing Cards";
    let preReq = chooseCards();
    let cardCount = fruitRack.length;
    const inLine = setInterval(()=>{
        if (gameStatus === "Displaying Cards"){
            fruits = fruitRack;
            previewCards(fruits);
        } else if (gameStatus === "Counting Down"){
            if(timerHit===false){
                countDown();
                timerHit = true;
            }
        } else if (gameStatus === "Un-Previewing Cards"){
            timerHit = false;
            unPreviewCards(cardCount);
        } else if (gameStatus === "Displaying Chosen One"){
            clearInterval(inLine);
            displayChosenOne(chosenOne);
            setTimeout(()=>{
                document.body.style.pointerEvents = "all";
                gameStatus = "Choosing Cards";
            },100);
        }
    },20);
}
