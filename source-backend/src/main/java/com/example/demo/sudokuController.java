package com.example.demo;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@CrossOrigin(origins = "*")
//@EnableAutoConfiguration
@RestController
public class sudokuController {

	@RequestMapping("/")
	public String index() {
		System.out.println("Handling path : /");
		return "Server is up";
	}

	/**
	 * This route handle move for sudoku game
	 * 
	 * @param payload - Map representing a json
	 * @return true or false
	 * @throws Exception
	 */
	@RequestMapping(value = "/move", method = RequestMethod.POST, headers = "Accept=application/json")
	public boolean move(@RequestBody Map<String, ?> payload) throws Exception {

		try {

			// parse and cast our 3 parameters index,val and sudokuTable
			Integer index = (Integer) payload.get("index");
			Integer val = (Integer) payload.get("val");
			ArrayList<Integer> sudokuTable = (ArrayList<Integer>) payload.get("sudokuTable");

			return isInputAccepted(index, val, sudokuTable);

		} catch (Exception e) {
			System.err.println("Error while computing move");
			System.err.println(e);
			return false;
		}

	}

	/**
	 * Return true if a new input added to the Sudoku is possible ortherwise false
	 * 
	 * @param index       - Index of the cell on the sudoku table
	 * @param val         - new input added by the user
	 * @param sudokuTable - Represent the current sudoku table
	 * @return
	 */
	public boolean isInputAccepted(int index, int val, ArrayList<Integer> sudokuTable) {

		int yIndex = (int) Math.floor(index / 9);
		int xIndex = index - yIndex * 9;
		System.out.println("Receiving input for : x index : " + yIndex + " | y index : " + xIndex);

		// Is 'x' used in row.
		for (int i = 0 + (yIndex * 9); i < 9 + (yIndex * 9); i++) {
			int valCell = sudokuTable.get(i).intValue();
			if (valCell == val && valCell != 0) {
				System.out.println("Input not accepted horizontally. cell value = " + valCell + " index : " + i);
				return false;
			}
		}

		// Is 'x' used in column.
		for (int j = 0; j < 9; j++) {
			int indexOfCellToLook = ((j * 9) + xIndex);
			int valCell = +sudokuTable.get(indexOfCellToLook).intValue();
			if (valCell == val && valCell != 0) {
				System.out.println(
						"Input not accepted vertically. cell value = " + valCell + " index : " + indexOfCellToLook);
				return false;
			}
		}

		// Is 'x' used in 3x3 submatrice .
		int boxRowStartIndex = (xIndex / 3 * 3);
		int boxColumnStartIndex = (yIndex / 3 * 3);

		for (int i = boxRowStartIndex; i < boxRowStartIndex + 3; i++) {
			for (int j = boxColumnStartIndex; j < boxColumnStartIndex; j++) {
				int indexOfCellToLook = ((j * 9) + i);
				int valCell = +sudokuTable.get(indexOfCellToLook).intValue();
				if (valCell == val && valCell != 0) {
					System.out.println(
							"Input not accepted for 3x3 sudoku box. cell value = " + valCell + " index : " + indexOfCellToLook);
					return false;
				}
			}
		}

		System.out.println("Input accepted");
		return true;
	}

}