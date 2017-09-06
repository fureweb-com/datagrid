import merge from 'lodash/merge';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';

const supportTouch = (window) ? (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) : false;

/**
 * @method ax5grid.util.divideTableByFrozenColumnIndex
 * @param _table
 * @param _frozenColumnIndex
 * @returns {{leftHeaderData: {rows: Array}, headerData: {rows: Array}}}
 */
const divideTableByFrozenColumnIndex = function (_table, _frozenColumnIndex) {

  let tempTable_l = {rows: []},
      tempTable_r = {rows: []};

  for (let r = 0, rl = _table.rows.length; r < rl; r++) {
    let row = _table.rows[r];

    tempTable_l.rows[r] = {cols: []};
    tempTable_r.rows[r] = {cols: []};

    for (let c = 0, cl = row.cols.length; c < cl; c++) {
      let col = merge({}, row.cols[c]),
          colStartIndex = col.colIndex,
          colEndIndex = col.colIndex + col.colspan;

      if (colStartIndex < _frozenColumnIndex) {
        if (colEndIndex <= _frozenColumnIndex) {
          // 좌측편에 변형없이 추가
          tempTable_l.rows[r].cols.push(col);
        } else {
          let leftCol = merge({}, col),
              rightCol = merge({}, leftCol);

          leftCol.colspan = _frozenColumnIndex - leftCol.colIndex;
          rightCol.colIndex = _frozenColumnIndex;
          rightCol.colspan = col.colspan - leftCol.colspan;

          tempTable_l.rows[r].cols.push(leftCol);
          if (rightCol.colspan) {
            tempTable_r.rows[r].cols.push(rightCol);
          }
        }
      }
      else {
        // 오른편
        tempTable_r.rows[r].cols.push(col);
      }

      col = null;
      colStartIndex = null;
      colEndIndex = null;
    }

    row = null;
  }

  return {
    leftData: tempTable_l,
    rightData: tempTable_r
  }
};

const getTableByStartEndColumnIndex = function (_table, _startColumnIndex, _endColumnIndex) {

  let tempTable = {rows: []};
  for (let r = 0, rl = _table.rows.length; r < rl; r++) {
    let row = _table.rows[r];

    tempTable.rows[r] = {cols: []};
    for (let c = 0, cl = row.cols.length; c < cl; c++) {
      let col = merge({}, row.cols[c]),
          colStartIndex = col.colIndex, colEndIndex = col.colIndex + col.colspan;

      if (_startColumnIndex <= colStartIndex || colEndIndex <= _endColumnIndex) {
        if (_startColumnIndex <= colStartIndex && colEndIndex <= _endColumnIndex) {
          // 변형없이 추가
          tempTable.rows[r].cols.push(col);
        }
        else if (_startColumnIndex > colStartIndex && colEndIndex > _startColumnIndex) {
          // 앞에서 걸친경우
          col.colspan = colEndIndex - _startColumnIndex;
          tempTable.rows[r].cols.push(col);
        }
        else if (colEndIndex > _endColumnIndex && colStartIndex <= _endColumnIndex) {
          tempTable.rows[r].cols.push(col);
        }
      }
    }
  }

  return tempTable;
};

const getMousePosition = function (e) {
  let mouseObj,
      originalEvent = (e.originalEvent) ? e.originalEvent : e;

  mouseObj = ('changedTouches' in originalEvent && originalEvent.changedTouches) ? originalEvent.changedTouches[0] : originalEvent;
  // clientX, Y 쓰면 스크롤에서 문제 발생
  return {
    clientX: mouseObj.pageX,
    clientY: mouseObj.pageY
  }
};

const ENM = {
  "mousedown": (supportTouch) ? "touchstart" : "mousedown",
  "mousemove": (supportTouch) ? "touchmove" : "mousemove",
  "mouseup": (supportTouch) ? "touchend" : "mouseup"
};

const makeHeaderTable = function (_columns) {
  let columns = U.deepCopy(_columns),
      cfg = this.config,
      table = {
        rows: []
      },
      colIndex = 0,
      maekRows = function (_columns, depth, parentField) {
        var row = {cols: []};
        var i = 0, l = _columns.length;

        for (; i < l; i++) {
          var field = _columns[i];
          var colspan = 1;

          if (!field.hidden) {
            field.colspan = 1;
            field.rowspan = 1;

            field.rowIndex = depth;
            field.colIndex = (function () {
              if (!parentField) {
                return colIndex++;
              } else {
                colIndex = parentField.colIndex + i + 1;
                return parentField.colIndex + i;
              }
            })();

            row.cols.push(field);

            if ('columns' in field) {
              colspan = maekRows(field.columns, depth + 1, field);
            } else {
              field.width = ('width' in field) ? field.width : cfg.columnMinWidth;
            }
            field.colspan = colspan;
          } else {


          }
        }

        if (row.cols.length > 0) {
          if (!table.rows[depth]) {
            table.rows[depth] = {cols: []};
          }
          table.rows[depth].cols = table.rows[depth].cols.concat(row.cols);
          return (row.cols.length - 1) + colspan;
        } else {
          return colspan;
        }

      };

  maekRows(columns, 0);

  // set rowspan
  for (let r = 0, rl = table.rows.length; r < rl; r++) {
    for (let c = 0, cl = table.rows[r].cols.length; c < cl; c++) {
      if (!('columns' in table.rows[r].cols[c])) {
        table.rows[r].cols[c].rowspan = rl - r;
      }
    }
  }

  return table;
};

const makeBodyRowTable = function (_columns) {
  let columns = U.deepCopy(_columns),
      table = {
        rows: []
      },
      colIndex = 0,
      maekRows = function (_columns, depth, parentField) {
        let row = {cols: []},
            i = 0,
            l = _columns.length,
            colspan = 1;

        let selfMakeRow = function (__columns) {
          let i = 0, l = __columns.length;
          for (; i < l; i++) {
            let field = __columns[i],
                colspan = 1;

            if (!field.hidden) {

              if ('key' in field) {
                field.colspan = 1;
                field.rowspan = 1;

                field.rowIndex = depth;
                field.colIndex = (function () {
                  if (!parentField) {
                    return colIndex++;
                  } else {
                    colIndex = parentField.colIndex + i + 1;
                    return parentField.colIndex + i;
                  }
                })();

                row.cols.push(field);
                if ('columns' in field) {
                  colspan = maekRows(field.columns, depth + 1, field);
                }
                field.colspan = colspan;
              }
              else {
                if ('columns' in field) {
                  selfMakeRow(field.columns, depth);
                }
              }
            }
            else {

            }
          }
        };

        for (; i < l; i++) {
          let field = _columns[i];
          colspan = 1;

          if (!field.hidden) {

            if ('key' in field) {
              field.colspan = 1;
              field.rowspan = 1;

              field.rowIndex = depth;
              field.colIndex = (function () {
                if (!parentField) {
                  return colIndex++;
                } else {
                  colIndex = parentField.colIndex + i + 1;
                  return parentField.colIndex + i;
                }
              })();

              row.cols.push(field);
              if ('columns' in field) {
                colspan = maekRows(field.columns, depth + 1, field);
              }
              field.colspan = colspan;
            }
            else {
              if ('columns' in field) {
                selfMakeRow(field.columns, depth);
              }
            }
          }
          else {

          }

          field = null;
        }

        if (row.cols.length > 0) {
          if (!table.rows[depth]) {
            table.rows[depth] = {cols: []};
          }
          table.rows[depth].cols = table.rows[depth].cols.concat(row.cols);
          return (row.cols.length - 1) + colspan;
        }
        else {
          return colspan;
        }
      };

  maekRows(columns, 0);

  (function (table) {
    // set rowspan
    for (let r = 0, rl = table.rows.length; r < rl; r++) {
      let row = table.rows[r];
      for (let c = 0, cl = row.cols.length; c < cl; c++) {
        let col = row.cols[c];
        if (!('columns' in col)) {
          col.rowspan = rl - r;
        }
        col = null;
      }
      row = null;
    }
  })(table);

  return table;
};

const makeBodyRowMap = function (_table) {
  let map = {};
  _table.rows.forEach(function (row) {
    row.cols.forEach(function (col) {
      map[col.rowIndex + "_" + col.colIndex] = merge({}, col);
    });
  });
  return map;
};

let makeFootSumTable = function (_footSumColumns) {
  let table = {
    rows: []
  };

  for (let r = 0, rl = _footSumColumns.length; r < rl; r++) {
    let footSumRow = _footSumColumns[r],
        addC = 0;

    table.rows[r] = {cols: []};

    for (let c = 0, cl = footSumRow.length; c < cl; c++) {
      if (addC > this.colGroup.length) break;
      let colspan = footSumRow[c].colspan || 1;
      if (footSumRow[c].label || footSumRow[c].key) {
        table.rows[r].cols.push({
          colspan: colspan,
          rowspan: 1,
          colIndex: addC,
          columnAttr: "sum",
          align: footSumRow[c].align,
          label: footSumRow[c].label,
          key: footSumRow[c].key,
          collector: footSumRow[c].collector,
          formatter: footSumRow[c].formatter
        });
      } else {
        table.rows[r].cols.push({
          colIndex: addC,
          colspan: colspan,
          rowspan: 1,
          label: "&nbsp;",
        });
      }
      addC += colspan;
      colspan = null;
    }

    if (addC < this.colGroup.length) {
      for (let c = addC; c < this.colGroup.length; c++) {
        table.rows[r].cols.push({
          colIndex: (c),
          colspan: 1,
          rowspan: 1,
          label: "&nbsp;",
        });
      }
    }
    footSumRow = null;
    addC = null;
  }

  return table;
};

const makeBodyGroupingTable = function (_bodyGroupingColumns) {
  let table = {
        rows: []
      },
      r = 0,
      addC = 0;

  table.rows[r] = {cols: []};
  for (let c = 0, cl = _bodyGroupingColumns.length; c < cl; c++) {
    if (addC > this.columns.length) break;
    let colspan = _bodyGroupingColumns[c].colspan || 1;
    if (_bodyGroupingColumns[c].label || _bodyGroupingColumns[c].key) {
      table.rows[r].cols.push({
        colspan: colspan,
        rowspan: 1,
        rowIndex: 0,
        colIndex: addC,
        columnAttr: "default",
        align: _bodyGroupingColumns[c].align,
        label: _bodyGroupingColumns[c].label,
        key: _bodyGroupingColumns[c].key,
        collector: _bodyGroupingColumns[c].collector,
        formatter: _bodyGroupingColumns[c].formatter
      });
    } else {
      table.rows[r].cols.push({
        rowIndex: 0,
        colIndex: addC,
        colspan: colspan,
        rowspan: 1,
        label: "&nbsp;"
      });
    }
    addC += colspan;
  }

  if (addC < this.colGroup.length) {
    for (var c = addC; c < this.colGroup.length; c++) {
      table.rows[r].cols.push({
        rowIndex: 0,
        colIndex: (c),
        colspan: 1,
        rowspan: 1,
        label: "&nbsp;",
      });
    }
  }

  return table;
};

const findPanelByColumnIndex = function (_dindex, _colIndex, _rowIndex) {
  let _containerPanelName,
      _isScrollPanel = false,
      _panels = [];

  if (this.xvar.frozenRowIndex > _dindex) _panels.push("top");
  if (this.xvar.frozenColumnIndex > _colIndex) _panels.push("left");
  _panels.push("body");

  if (this.xvar.frozenColumnIndex <= _colIndex || this.xvar.frozenRowIndex <= _dindex) {
    _containerPanelName = _panels.join("-");
    _panels.push("scroll");
    _isScrollPanel = true;
  }

  return {
    panelName: _panels.join("-"),
    containerPanelName: _containerPanelName,
    isScrollPanel: _isScrollPanel
  }
};

const getRealPathForDataItem = function (_dataPath) {
  let path = [],
      _path = [].concat(_dataPath.split(/[\.\[\]]/g));

  _path.forEach(function (n) {
    if (n !== "") path.push("[\"" + n.replace(/['\"]/g, "") + "\"]");
  });
  _path = null;
  return path.join("");
};


// for state ~~~~~~~~~~
const getStateForData = function (data) {
  // 그리드 데이터 준비 : dataOfList, dataOfPage를 미리 준비
  let stateForData = {
    dataOfList: [],
    proxyList: [],
    dataOfPage: false
  };

  if (isArray(data)) {
    stateForData.dataOfList = data;
  }
  else if (isPlainObject(data) && 'list' in data) {
    stateForData.dataOfList = data.list;
    stateForData.dataOfPage = data.page || {};
  }

  return stateForData;
};

export default {
  divideTableByFrozenColumnIndex: divideTableByFrozenColumnIndex,
  getTableByStartEndColumnIndex: getTableByStartEndColumnIndex,
  getMousePosition: getMousePosition,
  ENM: ENM,
  makeHeaderTable: makeHeaderTable,
  makeBodyRowTable: makeBodyRowTable,
  makeBodyRowMap: makeBodyRowMap,
  makeFootSumTable: makeFootSumTable,
  makeBodyGroupingTable: makeBodyGroupingTable,
  findPanelByColumnIndex: findPanelByColumnIndex,
  getRealPathForDataItem: getRealPathForDataItem,
  getStateForData: getStateForData
};