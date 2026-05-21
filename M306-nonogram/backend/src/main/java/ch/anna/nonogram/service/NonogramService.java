package ch.anna.nonogram.service;

import ch.anna.nonogram.model.NonogramPuzzle;
import ch.anna.nonogram.model.PuzzleResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class NonogramService {

    private final List<NonogramPuzzle> puzzles;

    public NonogramService() {
        this.puzzles = loadPuzzles();
    }

    public List<PuzzleResponse> getAllPuzzles() {
        return puzzles.stream()
                .map(this::toPuzzleResponse)
                .toList();
    }

    public PuzzleResponse getPuzzle(Long id) {
        NonogramPuzzle puzzle = findPuzzleById(id);
        return toPuzzleResponse(puzzle);
    }

    public boolean checkSolution(Long id, int[][] userGrid) {
        NonogramPuzzle puzzle = findPuzzleById(id);
        int[][] solution = puzzle.getSolution();

        if (!isValidGrid(userGrid, puzzle.getSize())) {
            return false;
        }

        for (int row = 0; row < solution.length; row++) {
            for (int col = 0; col < solution[row].length; col++) {
                int userCell = userGrid[row][col] == 1 ? 1 : 0;

                if (userCell != solution[row][col]) {
                    return false;
                }
            }
        }

        return true;
    }

    private List<NonogramPuzzle> loadPuzzles() {
        try {
            ObjectMapper objectMapper = new ObjectMapper();

            InputStream inputStream = getClass()
                    .getClassLoader()
                    .getResourceAsStream("puzzles.json");

            if (inputStream == null) {
                throw new RuntimeException("puzzles.json not found");
            }

            return objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<NonogramPuzzle>>() {}
            );
        } catch (Exception exception) {
            throw new RuntimeException("Could not load puzzles", exception);
        }
    }

    private NonogramPuzzle findPuzzleById(Long id) {
        return puzzles.stream()
                .filter(puzzle -> puzzle.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Puzzle not found"));
    }

    private PuzzleResponse toPuzzleResponse(NonogramPuzzle puzzle) {
        return new PuzzleResponse(
                puzzle.getId(),
                puzzle.getName(),
                puzzle.getSize(),
                calculateRowClues(puzzle.getSolution()),
                calculateColumnClues(puzzle.getSolution())
        );
    }

    private boolean isValidGrid(int[][] grid, int expectedSize) {
        if (grid == null || grid.length != expectedSize) {
            return false;
        }

        for (int[] row : grid) {
            if (row == null || row.length != expectedSize) {
                return false;
            }
        }

        return true;
    }

    private List<List<Integer>> calculateRowClues(int[][] solution) {
        List<List<Integer>> clues = new ArrayList<>();

        for (int[] row : solution) {
            clues.add(calculateLineClues(row));
        }

        return clues;
    }

    private List<List<Integer>> calculateColumnClues(int[][] solution) {
        List<List<Integer>> clues = new ArrayList<>();
        int size = solution.length;

        for (int col = 0; col < size; col++) {
            int[] column = new int[size];

            for (int row = 0; row < size; row++) {
                column[row] = solution[row][col];
            }

            clues.add(calculateLineClues(column));
        }

        return clues;
    }

    private List<Integer> calculateLineClues(int[] line) {
        List<Integer> clues = new ArrayList<>();
        int count = 0;

        for (int cell : line) {
            if (cell == 1) {
                count++;
            } else if (count > 0) {
                clues.add(count);
                count = 0;
            }
        }

        if (count > 0) {
            clues.add(count);
        }

        if (clues.isEmpty()) {
            clues.add(0);
        }

        return clues;
    }
}