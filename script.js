// DOM構築後に実行
$(function () {
  const peer = new Peer({
    key: "1e3c9a15-4485-4d10-aa19-67adc3ba5d70",
    debug: 3,
  });

  const connectedPeers = {};
  const DataChannels = {};

  peer.on("open", (id) => {
    console.log("id = " + id);
  });

  // connection.remoteIDを持っている
  peer.on("connection", (connection) => {
    DataChannels[connection.remoteId] = connection;
    connectDC(connection);
    console.log(connection);
  })

  peer.on("error", err => {
    console.log(err);
  });


  $("#connect").on("submit", e => {
    e.preventDefault();
    const roomName = $("#roomName").val();
    if (!roomName) {
      return;
    }
    // まだその名前のroomがなかった場合
    if (!connectedPeers[roomName]) {
      const room = peer.joinRoom("mesh_" + roomName);
      room.on("open", () => {
        //roomに接続したときの処理
        connectRoom(room);
        console.log("open room");
        connectedPeers[roomName] = room;
      })
    }
  });

  function connectRoom(room) {
    room.on("peerJoin", id => {
      console.log(id + "has joined");
      DataChannels[id] = peer.connect(id);
      DataChannels[id].on("data", data => {
        console.log(data);
      });
    })
  }

  // 非同期で複数のPeerからのdataを受け取る
  function connectDC(dataConnection) {
    dataConnection.on("data", async data => {
      await console.log(data);
    });
  }

  $("#send").on("click", function () {
    $.each(DataChannels, async (key, value) => {

      const result = await sendData(key, value);
    });
  })

  async function sendData(key, value) {
    await value.send("my name is " + key);
    for (var i = 0; i < 1000; i++) {
      await value.send(i);
      console.log(i + "to " + key);
    }
  }
})