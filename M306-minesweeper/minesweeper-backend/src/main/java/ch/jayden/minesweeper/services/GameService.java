package ch.jayden.minesweeper.services;

import ch.jayden.minesweeper.models.Board;
import ch.jayden.minesweeper.models.Cell;
import ch.jayden.minesweeper.models.GameState;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class GameService {
    private Board board;
    private int mines;

    public Board createGame(int width, int height, int mines) {
        board = new Board(width, height, mines);
        this.mines = mines;
        return board;
    }

    public Board getBoard() {
        return board;
    }

    public Board reveal(int x, int y) {
        if (board == null || board.getState() != GameState.RUNNING || !isInside(x, y)) {
            return board;
        }

        if (!board.isInitialized()) {
            placeMinesAvoiding(x, y);
            calculateNumbers();
            board.setInitialized(true);
        }

        Cell cell = board.getCells()[y][x];

        if (cell.isRevealed() || cell.isFlagged()) {
            return board;
        }

        if (cell.isMine()) {
            cell.setRevealed(true);
            revealAllMines();
            board.setState(GameState.LOST);
            return board;
        }

        floodReveal(x, y);
        checkWin();
        return board;
    }

    public Board toggleFlag(int x, int y) {
        if (board == null || board.getState() != GameState.RUNNING || !isInside(x, y)) {
            return board;
        }

        Cell cell = board.getCells()[y][x];

        if (!cell.isRevealed()) {
            cell.setFlagged(!cell.isFlagged());
        }

        return board;
    }

    private void placeMinesAvoiding(int safeX, int safeY) {
        Random random = new Random();
        int placed = 0;

        while (placed < mines) {
            int x = random.nextInt(board.getWidth());
            int y = random.nextInt(board.getHeight());

            if (x == safeX && y == safeY) {
                continue;
            }

            Cell cell = board.getCells()[y][x];

            if (!cell.isMine()) {
                cell.setMine(true);
                placed++;
            }
        }
    }

    private void calculateNumbers() {
        for (int y = 0; y < board.getHeight(); y++) {
            for (int x = 0; x < board.getWidth(); x++) {
                Cell cell = board.getCells()[y][x];

                if (cell.isMine()) {
                    continue;
                }

                cell.setAdjacentMines(countAdjacentMines(x, y));
            }
        }
    }

    private int countAdjacentMines(int x, int y) {
        int count = 0;

        for (int dy = -1; dy <= 1; dy++) {
            for (int dx = -1; dx <= 1; dx++) {
                if (dx == 0 && dy == 0) {
                    continue;
                }

                int nx = x + dx;
                int ny = y + dy;

                if (isInside(nx, ny) && board.getCells()[ny][nx].isMine()) {
                    count++;
                }
            }
        }

        return count;
    }

    private void floodReveal(int x, int y) {
        if (!isInside(x, y)) {
            return;
        }

        Cell cell = board.getCells()[y][x];

        if (cell.isRevealed() || cell.isFlagged()) {
            return;
        }

        cell.setRevealed(true);

        if (cell.getAdjacentMines() > 0) {
            return;
        }

        for (int dy = -1; dy <= 1; dy++) {
            for (int dx = -1; dx <= 1; dx++) {
                if (dx == 0 && dy == 0) {
                    continue;
                }

                floodReveal(x + dx, y + dy);
            }
        }
    }

    private void revealAllMines() {
        for (int y = 0; y < board.getHeight(); y++) {
            for (int x = 0; x < board.getWidth(); x++) {
                Cell cell = board.getCells()[y][x];

                if (cell.isMine()) {
                    cell.setRevealed(true);
                }
            }
        }
    }

    private boolean isInside(int x, int y) {
        return board != null
                && x >= 0
                && y >= 0
                && x < board.getWidth()
                && y < board.getHeight();
    }

    private void checkWin() {
        for (int y = 0; y < board.getHeight(); y++) {
            for (int x = 0; x < board.getWidth(); x++) {
                Cell cell = board.getCells()[y][x];

                if (!cell.isMine() && !cell.isRevealed()) {
                    return;
                }
            }
        }

        board.setState(GameState.WON);
    }
}
