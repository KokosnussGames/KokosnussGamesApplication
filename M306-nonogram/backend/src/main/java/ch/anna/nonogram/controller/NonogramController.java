package ch.anna.nonogram.controller;

import ch.anna.nonogram.model.CheckSolutionRequest;
import ch.anna.nonogram.model.CheckSolutionResponse;
import ch.anna.nonogram.model.PuzzleResponse;
import ch.anna.nonogram.service.NonogramService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nonogram")
public class NonogramController {

    private final NonogramService nonogramService;

    public NonogramController(NonogramService nonogramService) {
        this.nonogramService = nonogramService;
    }

    @GetMapping("/puzzles")
    public List<PuzzleResponse> getAllPuzzles() {
        return nonogramService.getAllPuzzles();
    }

    @GetMapping("/puzzles/{id}")
    public PuzzleResponse getPuzzle(@PathVariable Long id) {
        return nonogramService.getPuzzle(id);
    }

    @PostMapping("/puzzles/{id}/check")
    public CheckSolutionResponse checkSolution(
            @PathVariable Long id,
            @RequestBody CheckSolutionRequest request
    ) {
        boolean solved = nonogramService.checkSolution(id, request.getGrid());
        return new CheckSolutionResponse(solved);
    }
}
