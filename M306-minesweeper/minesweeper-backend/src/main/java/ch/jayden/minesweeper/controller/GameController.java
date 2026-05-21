package ch.jayden.minesweeper.controller;
import ch.jayden.minesweeper.models.Board;
import ch.jayden.minesweeper.services.GameService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class GameController {
    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @RequestMapping(value = "/new", method = {RequestMethod.GET, RequestMethod.POST})
    public Board newGame() {
        return gameService.createGame(10, 10, 10);
    }

    @PostMapping("/reveal/{x}/{y}")
    public Board reveal(@PathVariable int x, @PathVariable int y) {
        return gameService.reveal(x, y);
    }

    @GetMapping
    public Board getBoard() {
        return gameService.getBoard();
    }

    @PostMapping("/flag/{x}/{y}")
    public Board flag(@PathVariable int x, @PathVariable int y) {
        return gameService.toggleFlag(x, y);
    }
}
