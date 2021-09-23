Moralis.initialize("Q5CxuoP3y68q5lliPP6sfVBnQoDyx4ZTWRvMW15N");
Moralis.serverURL = "https://fu69ecu8hz7k.grandmoralis.com:2053/server";
const CONTRACT_ADDRESS = "0xD921B219D5F9979CBdA28F0a2c1d036Ce65C0091";




let DEX;
const NATIVE_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const ONEINCH_ADDRESS = "0x111111111117dc0aa78b770fa6a738034120c302";
const DIA_ADDRESS = "0x6b175474e89094c44da98b954eedeac495271d0f";
const SUSHI = "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"
async function init() {
     let user = await Moralis.User.current();
    //await Moralis.initPlugins();
    //DEX = Moralis.Plugins.oneInch;
    

    $('#game').hide();
    $('#btn-logout').hide();

    
    if(user){

        $('#btn-login').hide();

        $('#game').show();
        $('#btn-logout').show();

        displayWinnerData();
        displayLoserData();
        displayBigBetData();  
        displayDEX();
    }

    
  
}

/*
 async function dexSwap(){

    let user = await Moralis.User.current();
    let SwapAmount = document.getElementById('swapss').value;

    if(!user){   
        alert("Please sign in");
        login();
    }

    const receipt = await Moralis.Plugins.oneInch.swap({
        chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: NATIVE_ADDRESS, // The token you want to swap
        toTokenAddress: ONEINCH_ADDRESS, // The token you want to receive
        amount: Number(Moralis.Units.ETH(SwapAmount)),
        fromAddress: Moralis.User.current().get('ethAddress'), // Your wallet address
        slippage: 1,
      });
      console.log(receipt);

 }
*/

displayDEX = async () => {
    
    const table = document.getElementById('swapsTable');

    let row = table.insertRow();
    let count = 0;

    let dexPosition = row.insertCell(0);
    count++;
    dexPosition.innerHTML = count;

    let amountToSwap = row.insertCell(1);
    amountToSwap.innerHTML =`<input type="number" id="swapAmount" placeholder="value in eth" required>`
    let theToken = row.insertCell(2);
    theToken.innerHTML = `<img src="https://tokens.1inch.io/0x000000000000d0151e748d25b766e77efe2a6c83.png" alt="" width='50px;'></img>`
    let swapNow = row.insertCell(3);
    swapNow.innerHTML = `<button>Swap<button>`;


}

 displayWinnerData = async() => {
    let countTopWinner = 0;
    let winnerResults = await Moralis.Cloud.run('biggestWinner', {});
    

    const table = document.getElementById('winners');

    winnerResults.forEach( async (winnerResults)  =>{
       let row = table.insertRow();
       let chartPosition = row.insertCell(0);
       countTopWinner++;
       chartPosition.innerHTML = countTopWinner;
       let userAddress = row.insertCell(1);
       userAddress.innerHTML = await winnerResults.objectId;

       let TopAmount = row.insertCell(2);
       
       TopAmount.innerHTML = await  winnerResults.total_sum;
       
   })



 
}

displayLoserData = async() => {
    let countTopLoser = 0;
    let loserResults = await Moralis.Cloud.run('biggestLoser', {});
  
    const table = document.getElementById('losers');

    loserResults.forEach( async (loserResults)  =>{
       let row = table.insertRow();
       let chartPosition = row.insertCell(0);
       countTopLoser++;
       chartPosition.innerHTML = countTopLoser;
       let userAddress = row.insertCell(1);
       userAddress.innerHTML = await loserResults.objectId;
       let TopAmount = row.insertCell(2);
       
       TopAmount.innerHTML = await  loserResults.total_sum;
       
   })
}

displayBigBetData = async() => {
    let countBigBet = 0;
    
    let bigBetResults = await Moralis.Cloud.run('biggestBet', {});

    const table = document.getElementById('bigBets');

    bigBetResults.forEach( async (bigBetResults)  =>{
       let row = table.insertRow();
       let chartPosition = row.insertCell(0);
       countBigBet++;
       chartPosition.innerHTML = countBigBet;
       let userAddress = row.insertCell(1);
       userAddress.innerHTML = await bigBetResults.user;
       let BetAmount = row.insertCell(2);

       let totalETH = await  bigBetResults.bet;

       const etherValue = Web3.utils.fromWei(
        Web3.utils.toBN(totalETH, 'ether')
       );

       BetAmount.innerHTML = (etherValue + "ETH");

       let winOrLose = row.insertCell(3);
       winOrLose.innerHTML = await  bigBetResults.win;
       
   })
}
    
async function login(){
   try{

    user = await Moralis.User.current();

    if(!user){
        
        user = await Moralis.authenticate();

        $('#btn-login').hide();

        $('#game').show();
        $('#btn-logout').show();

        displayWinnerData();
        displayLoserData();
        displayBigBetData();   
       
    }

   }catch(error){
        console.log(error);
   }
}

async function logout(){   
    await Moralis.User.logOut();

    $('#game').hide();
    $('#btn-logout').hide();

    $('#btn-login').show();

}

async function flip(side){
    let sideNumber;
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];    

    if(side == "heads"){
        sideNumber = 0;
    }else{
        sideNumber = 1;
    }
    
    let amount = document.getElementById('amount').value;
    
   
    //the contract instance is how we interact with our contract using the web 3 sdk. passing the contract abi and address!!
    window.web3 = await Moralis.Web3.enable();
    let contractInstance = new web3.eth.Contract(window.abi, CONTRACT_ADDRESS);
    //const ethInWei = Moralis.Units.ETH(amount);

    //we attach value to a call by attaching the object to a .send and passing our options object.
    //ethereum.selectedAddress expose the current user address i.e. solidities msg.sender
    contractInstance.methods.flip(sideNumber).send({value: amount, from: account })
    .on('receipt', function(receipt){

        if(receipt.events.bet.returnValues.win == true){
            alert("You win!!!");
        }else if(receipt.events.bet.returnValues.win == false){
            alert("You lost!");
        }else{
            alert("Sorry Not enough funds in Dapp to cover bet");
        }
        
    }); 
    
    //.on is where we listen to the response from our contract.
    //the actual 'reciept' is what we get back from the blockchain whenever 
    //a transactions has been added to a block and we know the RESULT of the transaction.
    //in the reciept we have access to our events/emits!    
}

 dappBalance = async () =>{
     window.web3 = await Moralis.Web3.enable();
     let contractInstance = new web3.eth.Contract(window.abi, CONTRACT_ADDRESS);
     let currentBalance = await contractInstance.methods.getBalance().call();
     //const etherValue = Web3.utils.fromWei(currentBalance, 'ether');
    alert(currentBalance); 

}



init();

//handlers
document.getElementById('btn-login').onclick = login;
document.getElementById('btn-logout').onclick = logout;
document.getElementById('headsBtn').onclick = function(){flip('heads')};
document.getElementById('tailsBtn').onclick = function(){flip('tails')};
document.getElementById('balanceBtn').onclick = function(){dappBalance()}
//document.getElementById('oneInchSwap').onclick = dexSwap; 
