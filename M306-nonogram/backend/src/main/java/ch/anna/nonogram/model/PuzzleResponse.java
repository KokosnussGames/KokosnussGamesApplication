package ch.anna.nonogram.model;

import java.util.List;

public class PuzzleResponse {
    private Long id;
    private String name;
    private int size;
    private List<List<Integer>> rowClues;
    private List<List<Integer>> columnClues;

    public PuzzleResponse(
            Long id,
            String name,
            int size,
            List<List<Integer>> rowClues,
            List<List<Integer>> columnClues
    ) {
        this.id = id;
        this.name = name;
        this.size = size;
        this.rowClues = rowClues;
        this.columnClues = columnClues;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getSize() {
        return size;
    }

    public List<List<Integer>> getRowClues() {
        return rowClues;
    }

    public List<List<Integer>> getColumnClues() {
        return columnClues;
    }
}