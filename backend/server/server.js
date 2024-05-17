
import { WebSocketServer } from 'ws';
import { AddBricks } from './makeBoard.js';

//========== New WebSocket Server ========================

const wss = new WebSocketServer({ port: 8080 });

//========================================================

const Layout = AddBricks()
const map = JSON.stringify(AddBricks().flat())
const clients = new Map();
var waiting = '';


wss.on('connection', function connection(ws) {

  //to find key by value in a map
  function getByValue(map, searchValue) {
    for (let [key, value] of map.entries()) {
      if (value === searchValue)
        return key;
    }
  }


  //========================================================
  //========== START OF Timer Variables and Functions ======
  //========================================================

  //~~~~~~~~~~~~~~ START OF Timer variables ~~~~~~~~~~~~

  let timeInterval = null,//time stamp at game start
    timer = null,
    timeStatus = false,
    minutes = 0,
    seconds = 0,
    leadingMins = 0,
    leadingSecs = 0;

  //~~~~~~~~~~~~~~ END OF Timer variables ~~~~~~~~~~~~

  //~~~~~~~~~~~~~~ START OF Timer functions ~~~~~~~~~~~~

  function clear() {
    console.log('clear has been called')
    clearTimeout(timer)
    clearInterval(timeInterval)
  }

  //2 or 3 players have joined
  function twentySecondsStart() {
    console.log("twentySecondsStart has been called")
    //wait 200 milliseconds before starting timer
    timer = setTimeout(function () {
      timeStatus = true;
      timeInterval = setInterval(startTimer, 1000);
    }, 10);
  }

  // 10 seconds to start and no one else joins
  function tenSecondsStart() {
    seconds = 0
    console.log("tenSecondsStart has been called")
    seconds = 0
    timer = setTimeout(function () {
      timeStatus = true;
      timeInterval = setInterval(startTimer, 1000);
    }, 10);
  }

  //This is the timer function
  function startTimer() {
    console.log("startTimer has been called")

    seconds++;

    //if seconds dived by 60 = 1 set back the seconds to 0 and increment the minutes 
    if (seconds / 60 === 1) {
      seconds = 0;
      minutes++;
    }
    //add zero if seconds are less than 10
    if (seconds < 10) {
      leadingSecs = '0' + seconds.toString();
    } else {
      leadingSecs = seconds;
    };
    //add zero if minutes are less than 10
    if (minutes < 10) {
      leadingMins = '0' + minutes.toString();
    } else {
      leadingMins = minutes;
    };

    //send leadingSecs to all clients
    for (let [nickname, ws] of clients) {
      ws.send(JSON.stringify({
        type: 'seconds',
        data: leadingSecs
      }));
    }

    if (leadingSecs === '20' && waiting === 'wait20') {
      //assign the waiting variable 
      waiting = 'wait10';
      for (let [nickname, ws] of clients) {
        //console.log(nickname);
        ws.send(JSON.stringify({
          type: 'countdownMsg',
          data: 'Game starting in 10 seconds'
        }));
      }
      //stop the timer
      clear()

    } else if (leadingSecs === '10' && waiting === 'wait10') {
      //assign the waiting variable 
      waiting = 'gameOn';
      //send signal to start game
      for (let [nickname, ws] of clients) {
        //console.log(nickname);
        ws.send(JSON.stringify({
          type: 'countdownMsg',
          data: 'gameOn'
        }));
      }

      console.log("waiting inside startTimer:", waiting)

      //stop the timer
      clear()
    }
  }

  //~~~~~~~~~~~~~~ END OF Timer functions ~~~~~~~~~~~~

  //========================================================
  //========== END OF Timer Variables and Functions ========
  //========================================================

  //Below applies to 'on connection' server event

  ws.on('error', console.error);

  //send greeting to new client only
  ws.send(JSON.stringify({
    type: 'welcome',
    data: 'Greetings from server!'
  }));


  //=======================================================
  //======= START OF WS Server Message handling ===========
  //=======================================================

  ws.on('message', function message(data) {


    let wsMessage = JSON.parse(data);

    //~~~~~~~~~~~~~~ START OF Msg.Type Switch ~~~~~~~~~~~~~~~

    switch (wsMessage.type) {

      //send map when new client joins to new client only
      case 'openMessage':
        //send map to client when ws opens. Used inside nickName component

        ws.send(JSON.stringify({
          type: 'clientsMap',
          data: Array.from(clients.keys())
        }
        ));

        break;

      //new client nickname
      case 'nickName':
        console.log('Nickname received by server:', wsMessage.nickname);
        //check if nickname exists
        if (clients.size < 4 && clients.has(wsMessage.nickname) && wsMessage.join === true) {

          ws.send(JSON.stringify({
            type: 'nkNameChk',
            data: 'Nickname exists, try again'
          }));
          return;

          //if nickname is new add client to clients map
        } else if (clients.size < 4 && !clients.has(wsMessage.nickname) && wsMessage.join === true && (waiting === "" || waiting === 'wait20')) {

          //add client to clients map
          clients.set(wsMessage.nickname, ws);
          //send message to be displayed in nickName component
          ws.send(JSON.stringify({
            type: 'nkNameChk',
            data: 'Welcome Bomberman!'
          }));

          //send array of clients and Bomberman position to all clients
          for (let [nickname, ws] of clients) {
            let clientsM = {
              type: 'clientsMap',
              data: Array.from(clients.keys()),
            }
            if (wsMessage.nickname === nickname) {
              clientsM.position = Array.from(clients.keys()).length - 1,
                clientsM.whoAmI = wsMessage.nickname
            }

            ws.send(JSON.stringify(clientsM));

            console.log("nickname, array, position %n", nickname, Array.from(clients.keys()), Array.from(clients.keys()).length - 1)
            console.log("waiting value inside server.js:", waiting);

          }
          let m = JSON.stringify(Layout.flat())
          console.log("flat array", m, map)

          ws.send(
            JSON.stringify(
              {
                type: "board",
                map: map
              }
            )
          )


          //greeting for first Bomberman
          if (clients.size === 1) {
            waiting = "";
            ws.send(JSON.stringify({
              type: 'countdownMsg',
              data: 'You are first'
            }));
            //Greeting for second Bomberman & start timer
          } else if (clients.size === 2) {
            //assign the waiting variable 
            waiting = 'wait20';
            //send greeting to all clients & start timer
            for (let [nickname, ws] of clients) {
              ws.send(JSON.stringify({
                type: 'countdownMsg',
                data: 'Waiting for more players'
              }));
            }

            twentySecondsStart();

            //Third Bomberman joins within the 20 seconds window
          } else if (clients.size === 3 && waiting === 'wait20') {
            //assign the waiting variable 
            waiting = 'wait20';

            //fourth Bomber joins within the 20 seconds window
            //no one can join afterwards and 10 seconds to start game
          } else if (clients.size === 4 && waiting === 'wait20') {
            console.log("server.js waiting value when 4 bombermen:", waiting)
            //assign the waiting variable 
            waiting = 'wait10';
            for (let [nickname, ws] of clients) {
              ws.send(JSON.stringify({
                type: 'countdownMsg',
                data: 'Game starting in 10 seconds'
              }));
            }

            //stop the timer
            clear();
            //re-start the timer for 10 seconds
            tenSecondsStart();

          }

        } //end of <4 players have joined

        else if (clients.size > 4 || wsMessage.join === false || waiting === 'gameOn') {
          //assign the waiting variable 
          waiting = 'gameOn';
          //send message to be displayed in *** nickName ***
          ws.send(JSON.stringify({
            type: 'nkNameChk',
            data: "Game full. Try later"
          }));

          //for any other case:
        } else {
          //assign the waiting variable 
          waiting = 'gameOn';
          //send message to be displayed in *** nickName ***
          ws.send(JSON.stringify({
            type: 'nkNameChk',
            data: "Game full. Try later"
          }));
        }


        break;

      case 'clearTimer':
        console.log("timer cleared", leadingSecs);

        clear();

        break;


      case 'wait10':
        waiting = 'wait10'
        console.log("start 10 seconds countdown");
        for (let [nickname, ws] of clients) {
          ws.send(JSON.stringify({
            type: 'countdownMsg',
            data: 'Game starting in 10 seconds'
          }));
        }

        tenSecondsStart();

        break;

      case 'gameOn':
        waiting = 'gameOn'

        for (let [nickname, ws] of clients) {
          ws.send(JSON.stringify({
            type: 'countdownMsg',
            data: 'Game On'
          }));
        }
        break;


      //client message
      case 'chatMessage':
        console.log('Bomberman client chat', wsMessage.message);
        for (let [nickname, ws] of clients) {

          ws.send(JSON.stringify({
            type: 'chatMessage',
            data: wsMessage.message
          }));
        }
        break;

      case 'playerMove':
        for (let [_, ws] of clients) {
          ws.send(
            JSON.stringify(
              {
                type: "playerMove",
                player: wsMessage.player,
                direction: wsMessage.direction
              }
            )
          )
        }

        break

      case 'removePlayer':
        //console.log("clients map before removing player", clients)
        //find nickname by ws value:
        let nnm = getByValue(clients, ws)
        console.log("nickname to remove", nnm)
        ////close client ws connection & remove client from clients map
        for (let [nickname, ws] of clients) {
          if (nnm === nickname) {
            //close ws connection
            ws.close();
            clients.delete(nickname)
          }
        }

        console.log("clients map after removing player", clients)

        //send rump clients map to remaining players
        for (let [client, ws] of clients) {
          ws.send(JSON.stringify({
            type: 'clientsMap',
            data: Array.from(clients.keys())
          }));
        }

        break
      case 'gameLoad':
        ws.send(JSON.stringify({
          type: 'gameLoad',
        }));
      break 

    }

    //~~~~~~~~~~~~~~ END OF Msg.Type Switch ~~~~~~~~~~~~~~~


    wss.clients.forEach(function each(client) {

      if (client !== ws && client.readyState === WebSocketServer.OPEN) {
        client.send(data);
      }
    });
    ws.send(JSON.stringify({
      type: 'message',
      data: data
    }));

  });

  //=======================================================
  //======= END OF WS Server Message handling ===========
  //=======================================================

  ws.on('close', function close() {
    console.log('Bomberman client disconnected');
  });


});