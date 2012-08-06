function chess_logic () {
    this.clients;
    this.moveCount= 0;
    this.WHITE = 0x0;
    this.BLACK = 0x8;

    this.PAWN = 0x01;
    this.KNIGHT = 0x02;
    this.KING = 0x03;
    this.BISHOP = 0x05;
    this.ROOK = 0x06;
    this.QUEEN = 0x07;

    this.WHITE_PAWN = 0x01;
    this.WHITE_KNIGHT = 0x02;
    this.WHITE_KING = 0x03;
    this.WHITE_BISHOP = 0x05;
    this.WHITE_ROOK = 0x06;
    this.WHITE_QUEEN = 0x07;

    this.BLACK_PAWN = 0x09;
    this.BLACK_KNIGHT = 0x0A;
    this.BLACK_KING = 0x0B;
    this.BLACK_BISHOP = 0x0D;
    this.BLACK_ROOK = 0x0E;
    this.BLACK_QUEEN = 0x0F;

    this.board =[this.BLACK_ROOK, this.BLACK_KNIGHT, this.BLACK_BISHOP, this.BLACK_QUEEN, this.BLACK_KING, this.BLACK_BISHOP, this.BLACK_KNIGHT, this.BLACK_ROOK, 0, 0, 0, 0, 0, 0, 0, 0,
                 this.BLACK_PAWN, this.BLACK_PAWN, this.BLACK_PAWN, this.BLACK_PAWN, this.BLACK_PAWN, this.BLACK_PAWN, this.BLACK_PAWN, this.BLACK_PAWN, 0, 0, 0, 0, 0, 0, 0, 0,
                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                 this.WHITE_PAWN, this.WHITE_PAWN, this.WHITE_PAWN, this.WHITE_PAWN, this.WHITE_PAWN, this.WHITE_PAWN, this.WHITE_PAWN, this.WHITE_PAWN, 0, 0, 0, 0, 0, 0, 0, 0,
                 this.WHITE_ROOK, this.WHITE_KNIGHT, this.WHITE_BISHOP, this.WHITE_QUEEN, this.WHITE_KING, this.WHITE_BISHOP, this.WHITE_KNIGHT, this.WHITE_ROOK, 0, 0, 0, 0, 0, 0, 0, 0];

    this.currentPlayer = 0x0;
    this.castleRights = 0xF; // 4 bits to track castling on each side for both players

}

chess_logic.prototype.restart = function() {
    var self = this;

    self.moveCount = 0;
    self.board =[this.BLACK_ROOK, this.BLACK_KNIGHT, this.BLACK_BISHOP, this.BLACK_QUEEN, this.BLACK_KING, this.BLACK_BISHOP, this.BLACK_KNIGHT, this.BLACK_ROOK, 0, 0, 0, 0, 0, 0, 0, 0,
                 this.BLACK_PAWN, this.BLACK_PAWN, this.BLACK_PAWN, this.BLACK_PAWN, this.BLACK_PAWN, this.BLACK_PAWN, this.BLACK_PAWN, this.BLACK_PAWN, 0, 0, 0, 0, 0, 0, 0, 0,
                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                 this.WHITE_PAWN, this.WHITE_PAWN, this.WHITE_PAWN, this.WHITE_PAWN, this.WHITE_PAWN, this.WHITE_PAWN, this.WHITE_PAWN, this.WHITE_PAWN, 0, 0, 0, 0, 0, 0, 0, 0,
                 this.WHITE_ROOK, this.WHITE_KNIGHT, this.WHITE_BISHOP, this.WHITE_QUEEN, this.WHITE_KING, this.WHITE_BISHOP, this.WHITE_KNIGHT, this.WHITE_ROOK, 0, 0, 0, 0, 0, 0, 0, 0];
    return true;
}


chess_logic.prototype.validateMove = function (from, to) {
    var self = this;

    from = parseInt(from, 16);
    to = parseInt(to, 16);

    return self.isPseudoLegal(from, to, self.currentPlayer) && !self.checkAfterMove(from, to, self.currentPlayer);
}

chess_logic.prototype.isPseudoLegal = function (from, to, currentPlayer) {
    var self = this;

    var fromPiece = self.board[from] || 0;
    var toPiece = self.board[to] || 0;
    
    if(!fromPiece){ // Moving an empty square?
        return false;
    }

    if (to & 0x88){ // moving to outside valid board?
        console.log('SECURITY WARNING: Outside of valid space!');
        return false;
    }

    var pieceType = fromPiece & 0x07;

    if((fromPiece & 0x8) != currentPlayer) { // not your turn?       
        return false;
    }
    
    if(toPiece && (toPiece & 0x8) === currentPlayer) { // cannot attack one of your own
        console.log('Cannot attack one of your own color');
        return false;
    }

    
    if(pieceType === self.QUEEN){ // queen
        if( (Math.abs(from - to) % 15 && Math.abs(from - to) % 17) && // bishop move
            ((from & 0x0F) !== (to & 0x0F) && (from & 0xF0) !== (to & 0xF0))){ // rook move
            return false;
        }
    } else if(pieceType === self.ROOK) { // rook
        if( (from & 0x0F) !== (to & 0x0F) && (from & 0xF0) !== (to & 0xF0) ){ // move in a file or a rank
            return false;
        }
    } else if(pieceType === self.BISHOP) { // bishop
        if( Math.abs(from - to) % 15 && Math.abs(from - to) % 17 ){ // bishop can only move diagonally
            return false;
        }
    } else if(pieceType === self.KING) { // king
        var diff = Math.abs(from - to);
        var direction = from - to > 0 ? 0x0 : 0x1;

        if( diff === 1  || diff === 16 || diff === 17 || diff === 15 ) {
            // valid
        } else if ( diff === 2 && // castling
                   (self.castleRights >> (currentPlayer/4 + direction)) & 1 && // casling is available in this direction
                   ! self.isSquareUnderAttack(from, currentPlayer) && // king is not in check now
                   ! self.checkAfterMove(from, from + (direction ? 1 : -1), currentPlayer) && // the next square is not in check
                   self.isPseudoLegal(from + (direction ? 3 : -4), from + (direction ? 1 : -1), currentPlayer) ){ // rook can move
            // valid
        } else {
            return false;
        }
    } else if(pieceType === self.KNIGHT) { // knight
        var diff = Math.abs(from - to);
        if( diff !== 14 && diff !== 18 && diff !== 31 && diff !== 33 ){
            return false;
        }
    } else if(pieceType === self.PAWN) { // pawn
        var direction = from - to > 0 ? 0x0 : 0x8;
        var diff = Math.abs(from - to);
        var fromRow = from & 0x70;
        
        if( direction !== currentPlayer ) { // a pawn can only move forward
            return false;
        }
        
        if(diff === 16 && !toPiece) {  // single move forward?
            // valid
        } else if(diff === 32 &&
                  (fromRow === 0x60 || fromRow === 0x10) &&
                  !toPiece &&
                  !self.board[from + (direction ? 16 : -16)]){  // double move from start
            // valid
        } else if ((diff === 15 || diff === 17) && toPiece) {
            // valid
        } else {
            return false;
        }
        
        // todo - En passant        
    }
    
    
    if(fromPiece & 0x04) { // sliding piece
        var diff = to - from;
        var step;
        
        if(diff % 17 === 0) {
            step = 17;
        } else if(diff % 15 === 0) {
            step = 15;
        } else if(diff % 16 === 0) {
            step = 16;
        } else {
            step = 1;
        }
        
        var iterations = diff/step;
        if(iterations < 0) {
            step = -step;
            iterations = -iterations;
        }
        
        var path = from + step;
        for(var i = 1; i < iterations; i++, path+=step) {
            if(self.board[path]){
                return false;
            }
        }
    }

    return true;
}



chess_logic.prototype.makeMove = function(from, to) {
    var self = this;
    //from = parseInt(from, 16);
    //to = parseInt(to, 16);
    var capturedPiece = self.board[to];
    self.board[to] = self.board[from];
    self.board[from] = 0;
    
    var stateData = (capturedPiece << 4) + self.castleRights;

    if( (self.board[to] & 0x07) === self.KING ){

        // King-moves reset both castling bits per side.
        self.castleRights &= ~(3 << (self.currentPlayer/4));

        // move rook too if it is a castling move
        if( Math.abs(from - to) === 2 ){
            var rookTo = from + (from > to ? -1 : 1);
            var rookFrom = from + (from > to ? -4 : 3);

            self.board[rookTo] = self.board[rookFrom];
            self.board[rookFrom] = 0;
        }
    }

    // Rook-move resets castling in that side
    if( (self.board[to] & 0x07) === self.ROOK ){
        if(from === 0x0 || from === 0x70){
            var direction = 0;
            self.castleRights &= ~(1 << (self.currentPlayer / 4 + direction));
        } else if (from === 0x7 || from === 0x77) {
            var direction = 1;
            self.castleRights &= ~(1 << (self.currentPlayer / 4 + direction));
        }
    }

    // Capture of rook resets castling in that side
    if( (capturedPiece & 0x07) === self.ROOK ){
        if(to === 0x0 || to === 0x70){
            var direction = 0;
            var otherPlayer = self.currentPlayer ? 0 : 8;
            self.castleRights &= ~(1 << (otherPlayer/4 + direction));
        } else if (to === 0x7 || to === 0x77) {
            var direction = 1;
            var otherPlayer = self.currentPlayer ? 0 : 8;
            self.castleRights &= ~(1 << (otherPlayer/4 + direction));
        }
    }
    
    self.currentPlayer = self.currentPlayer ? 0 : 8;
    self.moveCount++;
    return stateData;
}



chess_logic.prototype.unMakeMove = function(from, to, stateData) {
    var self = this;

    self.board[from] = self.board[to];
    self.board[to] = stateData >> 4;
    self.castleRights = stateData & 0xF;

    // undo castling
    if( (self.board[from] & 0x07) === self.KING &&
        Math.abs(from - to) === 2){
        var rookTo = from + (from > to ? -1 : 1);
        var rookFrom = from + (from > to ? -4 : 3);

        self.board[rookFrom] = self.board[rookTo];
        self.board[rookTo] = 0;
    }

    self.currentPlayer = (self.currentPlayer === 0) ? 0x8 : 0x0;
    self.moveCount--;
    return true;
}

chess_logic.prototype.checkAfterMove = function (from, to, currentPlayer) {
    var self = this;

    var stateData = self.makeMove(from, to);

    /* Find my king */
    for( var i = 0 ; i < 128 ; i++ ){
        if(self.board[i] === (currentPlayer ? self.BLACK_KING : self.WHITE_KING) ){
            var kingPosition = i;
            break;
        }
    }

    var isKingUnderAttack = self.isSquareUnderAttack(kingPosition, currentPlayer);
    if(isKingUnderAttack) {
        self.unMakeMove(from, to, stateData);
    }
    //self.unMakeMove(from, to, stateData);
    return isKingUnderAttack;
}

chess_logic.prototype.isSquareUnderAttack = function (square, currentPlayer) {
    var self = this;

    for( var i = 0 ; i < 128 ; i++ ){
        if(self.board[i]){
            if(self.isPseudoLegal(i, square, currentPlayer ? 0x0 : 0x8)){
                return true;
            }
        }
    }
    return false;
}

module.exports = new chess_logic();