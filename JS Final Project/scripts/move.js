import CONSTANT from './constants.js';
import {
  captured,
  getFromSquare,
  getPieceColor,
  getToSquare,
  promoted,
} from './utils.js';

export default class MoveGen {
  constructor(board) {
    this.board = board;
    this.moves = [];
    this.nonSlidingWhitePiece = [CONSTANT.PIECES.wN, CONSTANT.PIECES.wK];
    this.nonSlidingBlackPiece = [CONSTANT.PIECES.bN, CONSTANT.PIECES.bK];
    this.nonSlidingAttacks = [CONSTANT.KNIGHT_ATTACKS, CONSTANT.KING_ATTACKS];

    this.slidingWhitePiece = [
      CONSTANT.PIECES.wB,
      CONSTANT.PIECES.wR,
      CONSTANT.PIECES.wQ,
    ];
    this.slidingBlackPiece = [
      CONSTANT.PIECES.bB,
      CONSTANT.PIECES.bR,
      CONSTANT.PIECES.bQ,
    ];
    this.slidingAttacks = [
      CONSTANT.BISHOP_ATTACKS,
      CONSTANT.ROOK_ATTACKS,
      CONSTANT.KING_ATTACKS,
    ];

    this.gameInfo = {};
    this.gameHistory = [];
  }

  getMove(from, to, captured, promoted, flag) {
    return from | (to << 7) | (captured << 14) | (promoted << 20) | flag;
  }

  getWhitePawnPromotionMoves(square, newSquare, captured) {
    let move = 0;
    if (this.board.ranksBoard[square] === CONSTANT.RANKS.RANK_7) {
      move = this.getMove(square, newSquare, captured, PIECES.wQ, 0);
      this.moves.push(move);
    } else {
      move = this.getMove(
        square,
        newSquare,
        captured,
        CONSTANT.PIECES.empty,
        0
      );
      this.moves.push(move);
    }
  }

  getWhitePawnForwardMoves(square) {
    //Check for forward move
    let newSquare = square + 10;
    let move = 0;
    if (this.board.pieces[newSquare] === CONSTANT.PIECES.empty) {
      //Check if it is on promotion square
      this.getWhitePawnPromotionMoves(square, newSquare, CONSTANT.PIECES.empty);

      // Check if it is on rank 2 where th pawn can move two steps forward
      newSquare = square + 20;
      if (
        this.board.ranksBoard[square] === CONSTANT.RANKS.RANK_2 &&
        this.board.pieces[newSquare] === CONSTANT.PIECES.empty
      ) {
        move = this.getMove(
          square,
          newSquare,
          CONSTANT.PIECES.empty,
          CONSTANT.PIECES.empty,
          CONSTANT.FLAG_PAWN_START
        );
        this.moves.push(move);
      }
    }
  }

  getWhitePawnCaptureMoves(square) {
    // Check for pawn captures
    let newSquare = square + CONSTANT.PAWN_ATTACKS[0];
    if (
      this.board.filesBoard[newSquare] !== CONSTANT.SQUARES.OFFBOARD &&
      getPieceColor(this.board.pieces[newSquare])
    ) {
      this.getWhitePawnPromotionMoves(
        square,
        newSquare,
        this.board.pieces[newSquare]
      );
    }

    newSquare = square + CONSTANT.PAWN_ATTACKS[1];
    if (
      this.board.filesBoard[newSquare] !== CONSTANT.SQUARES.OFFBOARD &&
      getPieceColor(this.board.pieces[newSquare])
    ) {
      this.getWhitePawnPromotionMoves(
        square,
        newSquare,
        this.board.pieces[newSquare]
      );
    }
  }

  getWhitePawnEnPassantMoves(square) {
    //check for en passants
    let newSquare = square + CONSTANT.PAWN_ATTACKS[0];
    if (newSquare === this.board.enPassant) {
      let move = this.getMove(
        square,
        newSquare,
        CONSTANT.PIECES.empty,
        CONSTANT.PIECES.empty,
        CONSTANT.FLAG_ENPASSANT
      );
      this.moves.push(move);
    }

    newSquare = square + CONSTANT.PAWN_ATTACKS[1];
    if (newSquare === this.board.enPassant) {
      let move = this.getMove(
        square,
        newSquare,
        CONSTANT.PIECES.empty,
        CONSTANT.PIECES.empty,
        CONSTANT.FLAG_ENPASSANT
      );
      this.moves.push(move);
    }
  }

  getWhiteSideCastleMoves() {
    if (this.board.castle & CONSTANT.CASTLE.WHITE_KING_CASTLE) {
      if (
        this.board.pieces[CONSTANT.SQUARES.G1] === CONSTANT.PIECES.empty &&
        this.board.pieces[CONSTANT.SQUARES.F1] === CONSTANT.PIECES.empty
      ) {
        if (
          this.board.isAttacked(CONSTANT.SQUARES.E1, CONSTANT.BLACK) ===
            false &&
          this.board.isAttacked(CONSTANT.SQUARES.F1, CONSTANT.BLACK) === false
        ) {
          let move = this.getMove(
            CONSTANT.SQUARES.E1,
            CONSTANT.SQUARES.G1,
            CONSTANT.PIECES.empty,
            CONSTANT.PIECES.empty,
            CONSTANT.FLAG_CASTLE
          );
          this.moves.push(move);
        }
      }
    }

    if (this.board.castle & CONSTANT.CASTLE.WHITE_QUEEN_CASTLE) {
      if (
        this.board.pieces[CONSTANT.SQUARES.B1] === CONSTANT.PIECES.empty &&
        this.board.pieces[CONSTANT.SQUARES.C1] === CONSTANT.PIECES.empty &&
        this.board.pieces[CONSTANT.SQUARES.D1] === CONSTANT.PIECES.empty
      ) {
        if (
          this.board.isAttacked(CONSTANT.SQUARES.E1, CONSTANT.BLACK) ===
            false &&
          this.board.isAttacked(CONSTANT.SQUARES.D1, CONSTANT.BLACK) === false
        ) {
          let move = this.getMove(
            CONSTANT.SQUARES.E1,
            CONSTANT.SQUARES.C1,
            CONSTANT.PIECES.empty,
            CONSTANT.PIECES.empty,
            CONSTANT.FLAG_CASTLE
          );
          this.moves.push(move);
        }
      }
    }
  }

  getWhitePawnMoves() {
    let piece = CONSTANT.PIECES.wP;

    for (let pieceNum = 0; pieceNum < this.board.pieceNum[piece]; pieceNum++) {
      let pieceIndex = piece * 10 + pieceNum;
      let square = this.board.pieceList[pieceIndex];

      this.getWhitePawnForwardMoves(square);
      this.getWhitePawnCaptureMoves(square);
      this.getWhitePawnEnPassantMoves(square);
    }
  }

  getBlackPawnPromotionMoves(square, newSquare, captured) {
    let move = 0;
    if (this.board.ranksBoard[square] === CONSTANT.RANKS.RANK_2) {
      move = this.getMove(square, newSquare, captured, PIECES.bQ, 0);
      this.moves.push(move);
    } else {
      move = this.getMove(
        square,
        newSquare,
        captured,
        CONSTANT.PIECES.empty,
        0
      );
      this.moves.push(move);
    }
  }

  getBlackPawnForwardMoves(square) {
    //Check for forward move
    let newSquare = square - 10;
    if (this.board.pieces[newSquare] === CONSTANT.PIECES.empty) {
      //Check if it is on promotion square
      this.getBlackPawnPromotionMoves(square, newSquare, CONSTANT.PIECES.empty);

      // Check if it is on rank 2 where th pawn can move two steps forward
      newSquare = square - 20;
      if (
        this.board.ranksBoard[square] === CONSTANT.RANKS.RANK_7 &&
        this.board.pieces[newSquare] === CONSTANT.PIECES.empty
      ) {
        let move = this.getMove(
          square,
          newSquare,
          CONSTANT.PIECES.empty,
          CONSTANT.PIECES.empty,
          CONSTANT.FLAG_PAWN_START
        );
        this.moves.push(move);
      }
    }
  }

  getBlackPawnCaptureMoves(square) {
    // Check for pawn captures
    let newSquare = square - CONSTANT.PAWN_ATTACKS[0];
    if (
      this.board.filesBoard[newSquare] !== CONSTANT.SQUARES.OFFBOARD &&
      getPieceColor(this.board.pieces[newSquare])
    ) {
      this.getBlackPawnPromotionMoves(
        square,
        newSquare,
        this.board.pieces[newSquare]
      );
    }

    newSquare = square - CONSTANT.PAWN_ATTACKS[1];
    if (
      this.board.filesBoard[newSquare] !== CONSTANT.SQUARES.OFFBOARD &&
      getPieceColor(this.board.pieces[newSquare])
    ) {
      this.getBlackPawnPromotionMoves(
        square,
        newSquare,
        this.board.pieces[newSquare]
      );
    }
  }

  getBlackPawnEnPassantMoves(square) {
    //check for en passants
    let newSquare = square - CONSTANT.PAWN_ATTACKS[0];
    if (newSquare === this.board.enPassant) {
      let move = this.getMove(
        square,
        newSquare,
        CONSTANT.PIECES.empty,
        CONSTANT.PIECES.empty,
        CONSTANT.FLAG_ENPASSANT
      );
      this.moves.push(move);
    }

    newSquare = square - CONSTANT.PAWN_ATTACKS[1];
    if (newSquare === this.board.enPassant) {
      let move = this.getMove(
        square,
        newSquare,
        CONSTANT.PIECES.empty,
        CONSTANT.PIECES.empty,
        CONSTANT.FLAG_ENPASSANT
      );
      this.moves.push(move);
    }
  }

  getBlackSideCastleMoves() {
    if (this.board.castle & CONSTANT.CASTLE.BLACK_KING_CASTLE) {
      if (
        this.board.pieces[CONSTANT.SQUARES.G8] === CONSTANT.PIECES.empty &&
        this.board.pieces[CONSTANT.SQUARES.F8] === CONSTANT.PIECES.empty
      ) {
        if (
          this.board.isAttacked(CONSTANT.SQUARES.E8, CONSTANT.BLACK) ===
            false &&
          this.board.isAttacked(CONSTANT.SQUARES.F8, CONSTANT.BLACK) === false
        ) {
          let move = this.getMove(
            CONSTANT.SQUARES.E8,
            CONSTANT.SQUARES.G8,
            CONSTANT.PIECES.empty,
            CONSTANT.PIECES.empty,
            CONSTANT.FLAG_CASTLE
          );
          this.moves.push(move);
        }
      }
    }

    if (this.board.castle & CONSTANT.CASTLE.BLACK_QUEEN_CASTLE) {
      if (
        this.board.pieces[CONSTANT.SQUARES.B8] === CONSTANT.PIECES.empty &&
        this.board.pieces[CONSTANT.SQUARES.C8] === CONSTANT.PIECES.empty &&
        this.board.pieces[CONSTANT.SQUARES.D8] === CONSTANT.PIECES.empty
      ) {
        if (
          this.board.isAttacked(CONSTANT.SQUARES.E8, CONSTANT.BLACK) ===
            false &&
          this.board.isAttacked(CONSTANT.SQUARES.D8, CONSTANT.BLACK) === false
        ) {
          let move = this.getMove(
            CONSTANT.SQUARES.E8,
            CONSTANT.SQUARES.C8,
            CONSTANT.PIECES.empty,
            CONSTANT.PIECES.empty,
            CONSTANT.FLAG_CASTLE
          );
          this.moves.push(move);
        }
      }
    }
  }

  getBlackPawnMoves() {
    let piece = CONSTANT.PIECES.bP;

    for (let pieceNum = 0; pieceNum < this.board.pieceNum[piece]; pieceNum++) {
      let pieceIndex = piece * 10 + pieceNum;
      let square = this.board.pieceList[pieceIndex];

      this.getBlackPawnForwardMoves(square);
      this.getBlackPawnCaptureMoves(square);
      this.getBlackPawnEnPassantMoves(square);
    }
  }

  getNonSlidingPieceMoves() {
    let nonSlidingPiece = [];
    if (this.board.side === CONSTANT.WHITE) {
      nonSlidingPiece = this.nonSlidingWhitePiece;
    } else {
      nonSlidingPiece = this.nonSlidingBlackPiece;
    }

    for (let i = 0; i < nonSlidingPiece.length; i++) {
      let piece = nonSlidingPiece[i];

      for (
        let pieceNum = 0;
        pieceNum < this.board.pieceNum[piece];
        pieceNum++
      ) {
        let pieceIndex = piece * 10 + pieceNum;
        let square = this.board.pieceList[pieceIndex];

        for (let j = 0; j < this.nonSlidingAttacks[i].length; j++) {
          let newSquare = square + this.nonSlidingAttacks[i][j];

          if (this.board.filesBoard[newSquare] === CONSTANT.SQUARES.OFFBOARD)
            continue;

          if (this.board.pieces[newSquare] === CONSTANT.PIECES.empty) {
            let move = this.getMove(
              square,
              newSquare,
              CONSTANT.PIECES.empty,
              CONSTANT.PIECES.empty,
              0
            );
            this.moves.push(move);
          } else {
            if (
              getPieceColor(this.board.pieces[newSquare]) != this.board.side
            ) {
              let move = this.getMove(
                square,
                newSquare,
                this.board.pieces[newSquare],
                CONSTANT.PIECES.empty,
                0
              );
              this.moves.push(move);
            }
          }
        }
      }
    }
  }

  getSlidingPieceMoves() {
    let slidingPiece = [];
    if (this.board.side === CONSTANT.WHITE) {
      slidingPiece = this.slidingWhitePiece;
    } else {
      slidingPiece = this.slidingBlackPiece;
    }

    for (let i = 0; i < slidingPiece.length; i++) {
      let piece = slidingPiece[i];

      for (
        let pieceNum = 0;
        pieceNum < this.board.pieceNum[piece];
        pieceNum++
      ) {
        let pieceIndex = piece * 10 + pieceNum;
        let square = this.board.pieceList[pieceIndex];

        for (let j = 0; j < this.slidingAttacks[i].length; j++) {
          let newSquare = square + this.slidingAttacks[i][j];

          while (
            this.board.filesBoard[newSquare] !== CONSTANT.SQUARES.OFFBOARD
          ) {
            if (this.board.pieces[newSquare] !== CONSTANT.PIECES.empty) {
              if (
                getPieceColor(this.board.pieces[newSquare]) !== this.board.side
              ) {
                let move = this.getMove(
                  square,
                  newSquare,
                  this.board.pieces[newSquare],
                  CONSTANT.PIECES.empty,
                  0
                );
                this.moves.push(move);
              }
            }

            let move = this.getMove(
              square,
              newSquare,
              CONSTANT.PIECES.empty,
              CONSTANT.PIECES.empty,
              0
            );
            this.moves.push(move);

            newSquare += this.slidingAttacks[i][j];
          }
        }
      }
    }
  }

  generatePseudoLegalMoves() {
    this.moves = [];
    if (this.board.side === CONSTANT.WHITE) {
      this.getWhitePawnMoves();
      this.getWhiteSideCastleMoves();
    } else {
      this.getBlackPawnMoves();
      this.getBlackSideCastleMoves();
    }

    this.getNonSlidingPieceMoves();
    this.getSlidingPieceMoves();

    this.board.moveList[this.board.ply] = this.moves;
  }

  movePiece(fromSquare, toSquare) {
    let movedPiece = this.board.pieces[fromSquare];
    this.board.pieces[fromSquare] = CONSTANT.PIECES.empty;
    this.board.pieces[toSquare] = movedPiece;

    for (
      let pieceNum = 0;
      pieceNum < this.board.pieceNum[movedPiece];
      pieceNum++
    ) {
      let pieceIndex = movedPiece * 10 + pieceNum;

      if (this.board.pieceList[pieceIndex] === fromSquare) {
        this.board.pieceIndex = toSquare;
      }
    }
  }

  addPiece(piece, square) {
    if (this.board.pieces[square] === CONSTANT.PIECES.empty) {
      this.board.pieces[square] = piece;
      this.board.totalMaterialForSide += CONSTANT.PIECE_VALUE[piece];

      let pieceIndex = piece * 10 + this.board.pieceNum[piece];
      this.board.pieceList[pieceIndex] = square;
      this.board.pieceNum[piece]++;
    }
  }

  clearPiece(square) {
    let piece = this.board.pieces[square];
    if (piece !== CONSTANT.PIECES.empty) {
      this.board.pieces[square] = CONSTANT.PIECES.empty;
      this.board.totalMaterialForSide -= CONSTANT.PIECE_VALUE[piece];

      for (let pieceNum = 0; pieceNum < this.board.pieceNum[piece]; piece++) {
        let pieceIndex = piece * 10 + pieceNum;
        if (this.board.pieceList[pieceIndex] === square) {
          let newPieceIndex = piece * 10 + this.board.pieceNum[piece];
          this.board.pieceList[pieceIndex] =
            this.board.pieceList[newPieceIndex];
          this.board.pieceNum[piece]--;
        }
      }

      this.board.fiftyMoves = 0;
    }
  }

  makeEnPassantMove(move) {
    let toSquare = getToSquare(move);
    if (move & CONSTANT.FLAG_ENPASSANT) {
      let enPassantPawnSquare = toSquare - 10;
      if (this.board.side === CONSTANT.WHITE) {
        this.clearPiece(enPassantPawnSquare);
      } else {
        enPassantPawnSquare = toSquare + 10;
        this.clearPiece(enPassantPawnSquare);
      }
    }
  }

  makeCastleMove(move) {
    let toSquare = getToSquare(move);
    if (move & CONSTANT.FLAG_CASTLE) {
      if (this.board.side === CONSTANT.WHITE) {
        if (toSquare === CONSTANT.SQUARES.G1) {
          this.movePiece(CONSTANT.SQUARES.H1, CONSTANT.SQUARES.F1);
        } else {
          this.movePiece(CONSTANT.SQUARES.A1, CONSTANT.SQUARES.D1);
        }
      } else {
        if (toSquare === CONSTANT.SQUARES.G8) {
          this.movePiece(CONSTANT.SQUARES.H8, CONSTANT.SQUARES.F8);
        } else {
          this.movePiece(CONSTANT.SQUARES.A8, CONSTANT.SQUARES.D8);
        }
      }
    }
  }

  makeCaptureMove(move) {
    let toSquare = getToSquare(move);
    this.clearPiece(toSquare);
  }

  makePawnStartMove(move) {
    let fromSquare = getFromSquare(move);

    if (
      this.board.pieces[fromSquare] === CONSTANT.PIECES.wP ||
      this.board.pieces[fromSquare] === CONSTANT.PIECES.bP
    ) {
      this.board.fiftyMoves = 0;
      if (move & CONSTANT.FLAG_PAWN_START) {
        if (this.board.side === CONSTANT.WHITE) {
          this.board.enPassant = fromSquare + 10;
        } else {
          this.board.enPassant = fromSquare - 10;
        }
      }
    }
  }

  makePromotionMove(move) {
    let toSquare = getToSquare(move);
    let promotedPiece = promoted(move);

    if (promotedPiece !== CONSTANT.PIECES.empty) {
      this.clearPiece(toSquare);
      this.addPiece(promotedPiece, toSquare);
    }
  }

  makeMove(move) {
    this.gameInfo = [];
    let fromSquare = getFromSquare(move);
    let toSquare = getToSquare(move);
    // let capturedSquare = captured(move);
    // let promotedSquare = promoted(move);

    this.makeEnPassantMove(move);
    this.makeCastleMove(move);

    this.gameInfo.move = move;
    this.gameInfo.castle = this.board.castle;
    this.gameInfo.enPassant = this.board.enPassant;
    this.gameInfo.fiftyMoves = this.board.fiftyMoves;

    this.board.castle &= CONSTANT.CASTLE_PERM[fromSquare];
    this.board.castle &= CONSTANT.CASTLE_PERM[toSquare];
    this.board.enPassant = 0;
    this.board.fiftyMoves++;

    this.makeCaptureMove(move);
    this.makePawnStartMove(move);

    this.movePiece(fromSquare, toSquare);

    this.makePromotionMove(move);

    this.board.side = +!this.board.side;

    this.gameHistory[this.board.gamePly] = this.gameInfo;
    console.log(this.gameHistory);

    this.board.gamePly++;
    this.board.ply++;
  }

  undoEnpassantMove(move) {
    let toSquare = getToSquare(move);
    if (move & CONSTANT.FLAG_ENPASSANT) {
      if (this.board.side === CONSTANT.WHITE) {
        this.addPiece(CONSTANT.PIECES.bP, toSquare - 10);
      } else {
        this.addPiece(CONSTANT.PIECES.wP, toSquare + 10);
      }
    }
  }

  undoCastleMove(move) {
    let toSquare = getToSquare(move);
    if (move & CONSTANT.FLAG_CASTLE) {
      if (this.board.side === CONSTANT.WHITE) {
        if (toSquare === CONSTANT.SQUARES.G1) {
          this.movePiece(CONSTANT.SQUARES.F1, CONSTANT.SQUARES.H1);
        } else {
          this.movePiece(CONSTANT.SQUARES.D1, CONSTANT.SQUARES.A1);
        }
      } else {
        if (toSquare === CONSTANT.SQUARES.G8) {
          this.movePiece(CONSTANT.SQUARES.F8, CONSTANT.SQUARES.H8);
        } else {
          this.movePiece(CONSTANT.SQUARES.D8, CONSTANT.SQUARES.A8);
        }
      }
    }
  }

  undoCaptureMove(move) {
    let toSquare = getToSquare(move);
    let capturedPiece = captured(move);
    if (capturedPiece !== CONSTANT.PIECES.empty) {
      this.addPiece(capturedPiece, toSquare);
    }
  }

  undoPromotedMove(move) {
    let fromSquare = getFromSquare(move);
    let promotedPiece = promoted(move);

    if (promotedPiece !== CONSTANT.PIECES.empty) {
      this.clearPiece(fromSquare);
      if (this.board.side === CONSTANT.WHITE) {
        this.addPiece(CONSTANT.PIECES.wP, fromSquare);
      } else {
        this.addPiece(CONSTANT.PIECES.bP, fromSquare);
      }
    }
  }

  undoMove() {
    this.board.gamePly--;
    this.board.ply--;

    let move = this.gameHistory[this.board.gamePly].move;
    this.board.castle = this.gameHistory[this.board.gamePly].castle;
    this.board.enPassant = this.gameHistory[this.board.gamePly].enPassant;
    this.board.fiftyMoves = this.gameHistory[this.board.gamePly].fiftyMoves;

    let fromSquare = getFromSquare(move);
    let toSquare = getToSquare(move);

    this.board.side = +!this.board.side;
    this.undoEnpassantMove(move);
    this.undoCastleMove(move);

    this.movePiece(toSquare, fromSquare);
    this.undoCaptureMove(move);
    this.undoPromotedMove(move);
  }
}
