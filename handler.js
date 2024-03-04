function Handler(socket) {

    this.socket = socket;

    if (typeof Handler.clientsMap == 'undefined') 
        Handler.clientsMap = new Map();
    if (typeof Handler.chatPairMap == 'undefined')
        Handler.chatPairMap = newMap();
        if (typeof Handler.waitingList == 'undefined')
        Handler.waitingList = [];

}