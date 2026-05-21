package ch.anna.nonogram.model;

public class CheckSolutionResponse {
    private boolean solved;

    public CheckSolutionResponse(boolean solved) {
        this.solved = solved;
    }

    public boolean isSolved() {
        return solved;
    }
}