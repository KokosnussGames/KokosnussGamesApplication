package ch.anna.nonogram.model;

public class NonogramPuzzle {
    private Long id;
    private String name;
    private int size;
    private int[][] solution;

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getSize() {
        return size;
    }

    public int[][] getSolution() {
        return solution;
    }
}