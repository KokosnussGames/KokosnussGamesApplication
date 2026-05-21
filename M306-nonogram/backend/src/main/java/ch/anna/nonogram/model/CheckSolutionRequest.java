package ch.anna.nonogram.model;

public class CheckSolutionRequest {
    private int[][] grid;

    public int[][] getGrid() {
        return grid;
    }

    public void setGrid(int[][] grid) {
        this.grid = grid;
    }
}