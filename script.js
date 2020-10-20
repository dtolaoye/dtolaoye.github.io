 // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  var firebaseConfig = {
    apiKey: "AIzaSyDpG7dDjrqV9ADVdT6hxvr9aRSfYhRC0sM",
    authDomain: "cpeg-cd8d7.firebaseapp.com",
    databaseURL: "https://cpeg-cd8d7.firebaseio.com",
    projectId: "cpeg-cd8d7",
    storageBucket: "cpeg-cd8d7.appspot.com",
    messagingSenderId: "1067230698036",
    appId: "1:1067230698036:web:179eb593d4e658e8660861",
    measurementId: "G-D6PYXP9ZVP"
  };
  
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// Global Variables 
var playerHand = []; 
var dealerHand = [];
var deck = []; 
var cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']; 

var turn = 1; 
var aceVal = 1;
var aceChanged = false; 
var gameDone = false; 
var first = true;
var startFlag = false; 

var count; 
var dlrCount;


//This is a silly andy trick, ignore or not
  var myid = "";
  if(localStorage) {
    if(!localStorage.getItem("sillyID")) {
        myid = "id"+Math.floor(Math.random()*500000000);
        localStorage.setItem("sillyID", myid);
    } else {
      myid = localStorage.getItem("sillyID");
    }
  }



newGameRef = firebase.database().ref("blackjack").child("games").child(myid);


function startGame(){
    $(".hidden").css("background-color: red");
    $(".hidden").css("color: red");
    
    clearDB();
    gameDone = false;
    aceChanged = false;
    first = true; 
    deck = [];
    playerHand = [];
    dealerHand = [];
    
    generateSuits(cards,'♠'); 
    generateSuits(cards,'♥'); 
    generateSuits(cards,'♣'); 
    generateSuits(cards,'♦');

    shuffleCards(deck);
    console.log(deck);
    
    newGameRef.set({
      playerCount: 0,
      dealerCount: 0
    });

    drawCard();
    drawCard();
}


function generateSuits(cardArr, suitString){
    
    for(i = 0; i < 13; i++){
        var suit = suitString;
        var card = suit.concat(cardArr[i]); 
        deck.push(card);
    }
}

function shuffleCards(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  console.log('Cards shuffled');
  return array;
}

function drawCard(){
    console.log('Game done? : ' + gameDone);
    if(gameDone != true){
        console.log('You drew!');
        playerHand.push(deck[0]);
        deck.splice(0, 1);
        console.log(deck.length);
        playerHand.reverse();
        
        $("#playerHand").append(`
        <div class="cardsContainer">
            <div class="cards">${playerHand[0].substring(1)}
            <div class="cardsSuit">${playerHand[0].substring(0,1)}</div>
            </div>
        </div>
        
        `);
        let playerCount = calculateHand(playerHand); 
        newGameRef.update({ playerCount: playerCount});
        console.log(playerHand[0]);
        dealerDraw(); 
    }
    else{
        alert('Press Play Again to refresh the game.');
    }
}
  
  


function dealerDraw(){
    
    let dealerCount;
    
    if(gameDone != true){
        console.log('Dealers turn!');
        dealerHand.push(deck[0]);
        deck.splice(0, 1);
        dealerHand.reverse();
        if(first){
            $("#dealerHand").append(`
            <div class="cards2Container">
                <div class="cards2">${dealerHand[0].substring(1)}
                 <div class="cardsSuit2">${dealerHand[0].substring(0,1)}</div>
                </div>
            </div>
            `);
            first = false;
        }
        else{
            $("#dealerHand").append(`
              <div class="hiddenContainer">
                <div class="hidden">${dealerHand[0].substring(1)}
                <div class="hiddenSuit">${dealerHand[0].substring(0,1)}</div>
                </div>
              </div>
              `);
          }
          dealerCount = calculateHand(dealerHand); 
          newGameRef.update({ dealerCount: dealerCount});
          console.log(deck.length);
        }
    }



function calculateHand(hand){
    let total = 0; 
    
    for(i = 0; i < hand.length; i++){
        let val;
        console.log('Hi');
        if((hand[i].substring(1) == 'J' )|| (hand[i].substring(1) == 'Q' )|| (hand[i].substring(1) == 'K' )){
            console.log('Face Card');
            val = 10; 
            total += val; 
        }
        else if(hand[i].substring(1) == 'A' && turn == 1){
            if(aceChanged != true){
                aceVal = handleAce();
                aceChanged = true;
            }
            total += aceVal; 
        }
        
        else if(hand[i].substring(1) == 'A' && turn == 2){
            let flip = Math.floor((Math.random() * 2) + 1);
            aceVal = (flip ? 1 : 11);
            total += aceVal; 
        }
        
        else{
            val = parseInt(hand[i].substring(1));
            total += val;
        }
    }
    
    console.log(total);
    return total;
}


function showHand(hand){
  console.log(hand); 
}

function stand(){
  console.log('User chooses to stand');
  var classes = document.getElementsByClassName('msg') == null ? true : false;

  if(dlrCount < 17){
      dealerDraw();
      console.log('Dealer drew');
  }
  
  var flip = Math.floor((Math.random() * 2) + 1);
  console.log(flip)
  
  if(dlrCount < 17 || flip == 1){
      dealerDraw();
      console.log('Dealer drew again');
  }
  else{
      console.log('Dealer did not draw again.');
  }
  
  if((count > dlrCount) && (count <= 21) && classes != false){
      console.log(count);
      console.log(dlrCount);
      $("#winlose").append(`<div class="msg">You had the higher amount. You won!</div>`);
      flipCard();
    }
    
    else if((count < dlrCount) && (dlrCount <= 21) && classes != false){
        $("#winlose").append(`<div class="msg">Dealer has the higher amount. Dealer wins!</div>`);
        flipCard();
    }
    
    else if(dlrCount == count && classes != false){
        $("#winlose").append(`<div class="msg">You tied!</div>`);
        flipCard();
    }
    else{
        console.log('Game still running');
    }
}

function clearDB(){
    newGameRef.set({dealerCount: 0, playerCount: 0});
}

function reset(){
    console.log('RESET 1');
    gameDone = false;
    turn = 1;
    $( "div.cards" ).remove();
    $( "div.cards2" ).remove();
    $( "div.hidden" ).remove();
    $( "div.cardsContainer" ).remove();
    $( "div.cards2Container" ).remove();
    $( "div.hiddenContainer" ).remove();
    $("div.msg").remove();
    console.log('RESET 2');
    console.log('RESET 3');
    startGame();
    console.log('Game reset');
    console.log(deck.length);
}

function handleAce(){
    flag = true;
    let input;
    
    try {
        input = parseInt(window.prompt("You drew an Ace. Please set the value to 1 or 11"));
    }
    
    catch(err) {
         alert('Please enter a numerical value');
    }
    
    while(flag){
        if(input == 1 || input == 11){
            break; 
    }
    
    else{
        alert('Please enter a valid value');
        input = window.prompt("You drew an Ace. Please set the value to 1 or 11");
    }
}
return input; 
}


startGame();


newGameRef.on('value', (snapshot)=>{
    count = parseInt(JSON.stringify(snapshot.val().playerCount));
    dlrCount = parseInt(JSON.stringify(snapshot.val().dealerCount));

    console.log(count);
    console.log(dlrCount);
    
    $("#playerlabel").text(`Player: ${count}`);
    
    console.log('Count changed');
    
    if(count > 21 && gameDone == false){
        $("#winlose").append(`<div class="msg">Bust! You went over 21</div>`);
        flipCard();
        gameDone = true; 
    } 
    
    else if(count == 21 && gameDone == false){
        $("#winlose").append(`<div class="msg">You got 21. You win!</div>`);
        flipCard();
        gameDone = true; 
    }
   
    else if(dlrCount > 21 && gameDone == false){
        $("#winlose").append(`<div class="msg">Dealer bust! You win!</div>`);
        flipCard();
        gameDone = true; 
    }
   
   else if(dlrCount == 21 && gameDone == false){
       $("#winlose").append(`<div class="msg">Dealer has 21. Dealer wins!</div>`);
       flipCard();
       gameDone = true;
    }
});

function debug(){
    console.log('Player Hand: '  + playerHand);
    console.log('Dealer Hand: ' + dealerHand);
    console.log('♠' == '♠');
}

function flipCard(){
  $(".hidden").css({
       "background-color": "white", 
       "color": "black",
      });
      $(".hiddenSuit").css({
       "color": "black"
      });
}

/*
function correctColor(){
  let suit = playerHand[0].substring(0,1);

  if(suit == '♠' || suit == '♣'){

  }
  else if(suit == '♥' || suit == '♦'){

  }
  else{
    console.log('Problem with equality.');
  }
}
*/