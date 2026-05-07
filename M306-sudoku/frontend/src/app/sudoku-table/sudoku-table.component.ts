import { Component, OnInit } from "@angular/core";
import * as $ from "jquery";
// import * as axios from "axios";
// const axios = require("axios").default;
import axios from "axios";

@Component({
  selector: "app-sudoku-table",
  templateUrl: "./sudoku-table.component.html",
  styleUrls: ["./sudoku-table.component.css"]
})
export class SudokuTableComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    $(document).ready(function() {
      // Add event listenner on cell input, cell input will be send to the java backend for confirmation of input
      $("td").keyup(function(event) {
        let cell = event.currentTarget;

        // if the input is not a valid number (1-9) we clear the cell
        var pattern = /^[1-9]+$/;
        let currentValue = cell.innerText; //x
        let isInputValid = pattern.test(currentValue);
        if (!isInputValid) {
          cell.innerText = "";
          $(cell).removeClass("incorrect-input");
          return false;
        }

        let cellIndex = cell.getAttribute("cell-index");
        cellIndex = parseInt(cellIndex, 10);
        let rowIndex = Math.floor(cellIndex / 9); //y
        let cellIndexInRow = cellIndex - rowIndex * 9; //x
        console.log(`current input on : 
        - cellIndex : ${cellIndex}
        - rowIndex : ${rowIndex} 
        - cellIndexInRow : ${cellIndexInRow}
        - currentValue : ${currentValue}`);

        //sudoku table representation
        var listTD = $("td");
        var sudokuTable = new Array(81);
        $.each(listTD, function(index, cell) {
          let cellIndexListTD = cell.getAttribute("cell-index");
          let cellVal = cell.innerText;
          if (cellVal == "" || cellIndexListTD == cellIndex) {
            cellVal = 0;
          } else {
            cellVal = parseInt(cellVal);
          }
          sudokuTable[cellIndexListTD] = cellVal;
        });

        var jsonToSend = {
          val: parseInt(currentValue),
          index: cellIndex,
          sudokuTable: sudokuTable
        };
        console.log(jsonToSend);

        // use axios module to send the json to the backend
        axios
          .post("http://localhost:8080/demo/move", jsonToSend)
          .then(response => {
            if (response.data == true) {
              $(cell).removeClass("incorrect-input");
              return true;
            } else {
              $(cell).addClass("incorrect-input");
              return false;
            }
          })
          .catch(error => {
            console.log(error);
          });
      }); // td keyup
    });
  }
}
