import * as React from 'react';
import { Range } from 'immutable';
import { E_NAME, KEY_CODE } from '../_inc/constant';
import { GridBodyCell } from './GridBodyCell';
import cx from 'classnames';

export class GridBodyPanel extends React.Component<iAXDataGridBodyPanelProps, iAXDataGridBodyPanelState> {

  constructor( props: iAXDataGridBodyPanelProps ) {
    super( props );

    this.state = {};

    this.onEditInput = this.onEditInput.bind( this );
  }

  private onEditInput( E_TYPE: string, e ) {
    const {
            updateEditInput,
            inlineEditingCell
          } = this.props;

    const proc = {
      [E_NAME.BLUR]: () => {
        updateEditInput( 'cancel' );
      },
      [E_NAME.KEY_DOWN]: () => {
        if ( e.which === KEY_CODE.ESC ) {
          updateEditInput( 'cancel' );
        }
        else if ( e.which === KEY_CODE.RETURN ) {
          updateEditInput( 'update', inlineEditingCell.row, inlineEditingCell.col, e.target.value );
        }
      }
    };
    proc[ E_TYPE ]();
  }

  public render() {

    const {
            styles,
            options,
            colGroup,
            selectionRows,
            selectionCols,
            focusedRow,
            focusedCol,
            columnFormatter,
            onDoubleClickCell,
            isInlineEditing,
            inlineEditingCell,
            list,
            panelBodyRow,
            panelColGroup,
            panelGroupRow,
            panelName,
            panelScrollConfig,
            panelLeft        = 0,
            panelTop         = 0,
            panelPaddingLeft = 0
          } = this.props;

    const { sRowIndex, eRowIndex, frozenRowIndex } = panelScrollConfig;
    const panelStyle = {
      left: panelLeft,
      top: panelTop,
      paddingTop: (sRowIndex - frozenRowIndex) * styles.bodyTrHeight,
      paddingLeft: (panelPaddingLeft) ? panelPaddingLeft : 0
    };

    return (
      <div data-panel={panelName} style={panelStyle}>
        <table style={{ height: '100%' }}>
          <colgroup>
            {panelColGroup.map(
              ( col, ci ) => (
                <col
                  key={ci}
                  style={{ width: col._width + 'px' }} />
              )
            )}
            <col />
          </colgroup>
          <tbody>
          {Range( sRowIndex, eRowIndex ).map(
            ( li ) => {
              const item = list.get( li );
              const trClassNames = {
                ['odded-line']: li % 2
              };
              if ( item ) {
                return (
                  panelBodyRow.rows.map(
                    ( row, ri ) => {
                      return (
                        <tr
                          key={ri} className={cx( trClassNames )}>
                          {row.cols.map( ( col, ci ) => {
                            return <GridBodyCell
                              key={ci}
                              columnHeight={options.body.columnHeight}
                              columnPadding={options.body.columnPadding}
                              columnBorderWidth={options.body.columnBorderWidth}
                              bodyAlign={options.body.align}
                              focusedRow={focusedRow}
                              focusedCol={focusedCol}
                              selectionRows={selectionRows}
                              selectionCols={selectionCols}
                              columnFormatter={columnFormatter}
                              isInlineEditing={isInlineEditing}
                              inlineEditingCell={inlineEditingCell}

                              list={list}
                              li={li}
                              colGroup={colGroup}
                              col={col}
                              ci={ci}
                              value={item[ col.key ]}

                              onEditInput={this.onEditInput}
                              onDoubleClickCell={onDoubleClickCell}
                            />
                          } )}
                          <td>&nbsp;</td>
                        </tr>
                      )
                    }
                  )
                )
              }
            }
          )}
          </tbody>
        </table>
      </div>
    )
  }
}
