import CONSTANT from './constants.js';
import {
  getSquareFromFileAndRank,
  square64To120,
  getPieceColor,
} from './utils.js';

import Pawn from './pieces/pawn.js';
import Knight from './pieces/knight.js';
import Bishop from './pieces/bishop.js';
import Rook from './pieces/rook.js';
import Queen from './pieces/queen.js';
import King from './pieces/king.js';

export default class Board {
  constructor() {
    this.pieces = [];
    this.side = CONSTANT.WHITE;
    this.enPassant = 0;
    this.castle = 0;
    this.pieceNum = [];
    this.pieceList = [];
    this.filesBoard = [];
    this.ranksBoard = [];
    this.zobristKey = 0;
    this.maximunSinglePiece = 14;
    this.material = [];
  }

  initialize() {
    this.initializeFilesAndRanksBoard();
    this.parseFEN('q3k2b/8/3n4/8/8/8/8/R3K2R b KQkq - 0 1');
    this.renderBoard();
    this.getPieceList();
    // this.printPieceLists();
    this.renderAttackedBoard();
  }

  initializeFilesAndRanksBoard() {
    this.filesBoard = Array(CONSTANT.TOTAL_SQUARES).fill(
      CONSTANT.SQUARES.OFFBOARD
    );
    this.ranksBoard = Array(CONSTANT.TOTAL_SQUARES).fill(
      CONSTANT.SQUARES.OFFBOARD
    );

    for (
      let rank = CONSTANT.RANKS.RANK_1;
      rank <= CONSTANT.RANKS.RANK_8;
      rank++
    ) {
      for (
        let file = CONSTANT.FILES.FILE_A;
        file <= CONSTANT.FILES.FILE_H;
        file++
      ) {
        let square = getSquareFromFileAndRank(file, rank);
        this.filesBoard[square] = file;
        this.ranksBoard[square] = rank;
      }
    }

    // console.log('FilesBoard: ' + this.filesBoard);
    // console.log('RanksBoard: ' + this.ranksBoard);
  }

  getPieceList() {
    this.pieceList = Array(
      this.maximunSinglePiece * CONSTANT.TOTAL_SQUARES
    ).fill(0);
    this.pieceNum = Array(this.maximunSinglePiece).fill(0);
    this.material = Array(2).fill(0);

    for (let i = 0; i < 64; i++) {
      let square = square64To120(i);
      let piece = this.pieces[square];

      if (piece !== CONSTANT.PIECES.empty) {
        let color = getPieceColor(piece);

        this.material[color] += CONSTANT.PIECE_VALUE[piece];
        let pieceIndex = piece * 10 + this.pieceNum[piece];
        this.pieceList[pieceIndex] = square;
        this.pieceNum[piece]++;
      }
    }
  }

  printSquare(sq) {
    return (
      CONSTANT.FILE_CHARACTER[this.filesBoard[sq]] + (this.ranksBoard[sq] + 1)
    );
  }

  printPieceLists() {
    let piece, pceNum;

    for (piece = CONSTANT.PIECES.wP; piece <= CONSTANT.PIECES.bK; piece++) {
      for (pceNum = 0; pceNum < this.pieceNum[piece]; pceNum++) {
        let pieceIndex = piece * 10 + pceNum;
        console.log(
          'Piece ' +
            CONSTANT.PIECE_CHARACTER[piece] +
            ' on ' +
            this.printSquare(this.pieceList[pieceIndex])
        );
      }
    }
  }

  renderBoard() {
    let line = '';
    for (
      let rank = CONSTANT.RANKS.RANK_8;
      rank >= CONSTANT.RANKS.RANK_1;
      rank--
    ) {
      line += rank + 1 + ' ';
      for (
        let file = CONSTANT.FILES.FILE_A;
        file <= CONSTANT.FILES.FILE_H;
        file++
      ) {
        let square = getSquareFromFileAndRank(file, rank);
        line += CONSTANT.PIECE_CHARACTER[this.pieces[square]] + ' ';
      }
      line += '\n';
    }
    line += ' ';
    for (
      let file = CONSTANT.FILES.FILE_A;
      file <= CONSTANT.FILES.FILE_H;
      file++
    ) {
      line += ' ' + CONSTANT.FILE_CHARACTER[file];
    }
    console.log(line);
  }

  parseFEN(fen) {
    let piece = 0;
    let count = 0;
    let rank = CONSTANT.RANKS.RANK_8;
    let file = CONSTANT.FILES.FILE_A;
    let square = 0;

    let fenString = fen.split(' ');

    //rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1

    for (let i = 0; i < fenString[0].length; i++) {
      //   console.log(fenString[0][i]);
      count = 1;
      switch (fenString[0][i]) {
        case 'p':
          piece = CONSTANT.PIECES.bP;
          break;
        case 'r':
          piece = CONSTANT.PIECES.bR;
          break;
        case 'n':
          piece = CONSTANT.PIECES.bN;
          break;
        case 'b':
          piece = CONSTANT.PIECES.bB;
          break;
        case 'k':
          piece = CONSTANT.PIECES.bK;
          break;
        case 'q':
          piece = CONSTANT.PIECES.bQ;
          break;
        case 'P':
          piece = CONSTANT.PIECES.wP;
          break;
        case 'R':
          piece = CONSTANT.PIECES.wR;
          break;
        case 'N':
          piece = CONSTANT.PIECES.wN;
          break;
        case 'B':
          piece = CONSTANT.PIECES.wB;
          break;
        case 'K':
          piece = CONSTANT.PIECES.wK;
          break;
        case 'Q':
          piece = CONSTANT.PIECES.wQ;
          break;

        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
          piece = CONSTANT.PIECES.empty;
          count = parseInt(fenString[0][i]);
          break;

        case '/':
          rank--;
          file = CONSTANT.FILES.FILE_A;
          continue;

        default:
          console.log('fen error');
          return;
      }

      for (let i = 0; i < count; i++) {
        square = getSquareFromFileAndRank(file, rank);
        this.pieces[square] = piece;
        file++;
      }
    }

    if (fenString[1] === 'w') {
      this.side = CONSTANT.WHITE;
    } else {
      this.side = CONSTANT.BLACK;
    }

    for (let i = 0; i < fenString[2].length; i++) {
      switch (fenString[0][i]) {
        case 'K':
          this.castle = CONSTANT.CASTLE.WHITE_KING_CASTLE;
        case 'Q':
          this.castle = CONSTANT.CASTLE.WHITE_QUEEN_CASTLE;
        case 'k':
          this.castle = CONSTANT.CASTLE.BLACK_KING_CASTLE;
        case 'q':
          this.castle = CONSTANT.CASTLE.BLACK_QUEEN_CASTLE;
        case '-':
          continue;
      }
    }

    if (fenString[3] !== '-') {
      file = fenString[3][0].charCodeAt() - 'a'.charCodeAt();
      rank = parseInt(fenString[3][1]);
      this.enPassant = getSquareFromFileAndRank(file, rank);
    }
  }

  isAttacked(square, side) {
    let pawn = new Pawn(this);
    let knight = new Knight(this);
    let bishop = new Bishop(this);
    let rook = new Rook(this);
    let queen = new Queen(this);
    let king = new King(this);

    return (
      pawn.isPawnAttacking(square, side) ||
      knight.isKnightAttacking(square, side) ||
      bishop.isBishopAttacking(square, side) ||
      rook.isRookAttacking(square, side) ||
      queen.isQueenAttacking(square, side) ||
      king.isKingAttacking(square, side)
    );
  }

  renderAttackedBoard() {
    let line = '';
    let piece = '-';
    for (
      let rank = CONSTANT.RANKS.RANK_8;
      rank >= CONSTANT.RANKS.RANK_1;
      rank--
    ) {
      line += rank + 1 + ' ';
      for (
        let file = CONSTANT.FILES.FILE_A;
        file <= CONSTANT.FILES.FILE_H;
        file++
      ) {
        let square = getSquareFromFileAndRank(file, rank);
        if (this.isAttacked(square, this.side) === true) piece = 'X';
        else piece = '-';
        line += piece + ' ';
      }
      line += '\n';
    }
    line += ' ';
    for (
      let file = CONSTANT.FILES.FILE_A;
      file <= CONSTANT.FILES.FILE_H;
      file++
    ) {
      line += ' ' + CONSTANT.FILE_CHARACTER[file];
    }
    console.log(line);
  }
}
