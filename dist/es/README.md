[![npm version](https://badge.fury.io/js/datagrid-es.svg)](https://badge.fury.io/js/datagrid-es)
[![](https://img.shields.io/npm/dm/datagrid-es.svg)](https://www.npmjs.com/package/datagrid-es)

# datagrid

## Install

```
npm install datagrid-es -S
```


## Usage
```js
import * as React from 'react';
import { Container, Segment, Divider, Button } from 'semantic-ui-react';
import { AXDatagrid } from 'datagrid-es';

export class LargeData extends React.Component {
  constructor( props ) {
    super( props );

    let gridData = [];

    const typeGroup = {
      aTypes: [ 'A', 'B', 'C', 'D' ],
      bTypes: [ 'A01', 'A02', 'B01', 'B02', 'C01', 'C02' ],
      cTypes: [ 'Thomas', 'Brant', 'Ben', 'Woo' ],
      priceTypes: [ 500, 1000, 1500, 2000 ],
      amountTypes: [ 1, 2, 4, 5, 10, 20 ],
      saleTypes: [ 'T', 'B', 'H', 'W' ],
      saleDtTypes: [ '2018-01-20', '2018-01-21', '2018-02-01', '2018-02-02', '2018-02-03' ],
      customerTypes: [ '장기영', '황인서', '양용성', '이하종', '김혜미', '홍시아' ]
    };

    const getTypes = ( typeName ) => {
      const types = typeGroup[ typeName ];
      return types[ Math.floor( Math.random() * types.length ) ];
    };

    for ( let i = 1; i < 10000; i++ ) {
      const price = getTypes( 'priceTypes' );
      const amount = getTypes( 'amountTypes' );

      gridData.push( {
        a: getTypes( 'aTypes' ), b: getTypes( 'bTypes' ), c: getTypes( 'cTypes' ),
        saleDt: getTypes( 'saleDtTypes' ), customer: getTypes( 'customerTypes' ), saleType: getTypes( 'saleTypes' ),
        price: price, amount: amount, cost: price * amount
      } );
    }

    this.state = {
      height: 300,
      columns: [
        {
          key: 'a',
          label: '필드A',
          width: 80,
          align: 'center'
        },
        { key: 'b', label: '필드B', align: 'center' },
        { key: 'c', label: '필드C', align: 'center' },
        { key: 'price', label: '단가', formatter: 'money', align: 'right' },
        { key: 'amount', label: '수량', formatter: 'money', align: 'right' },
        { key: 'cost', label: '금액', align: 'right', formatter: 'money' },
        { key: 'saleDt', label: '판매일자', align: 'center' },
        { key: 'customer', label: '고객명', align: 'center' },
        { key: 'saleType', label: '판매타입', align: 'center' }
      ],
      data: gridData,
      options: {
        lineNumberColumnWidth: 60,
        header: {
          align: 'center'
        },
        showLineNumber: true,
        showRowSelector: false
      }
    }
  }

  private changeConfig( props, value ) {

    const processor = {
      'setHeight': () => {
        this.setState( {
          height: value
        } );
      }
    };

    if ( props in processor ) {
      processor[ props ].call( this );
    } else {
      this.setState( value );
    }

  }

  render() {
    return (
      <Container>
        <Segment basic padded>
          <h1>LargeData</h1>

          <AXDatagrid
            height={this.state.height}
            style={{ fontSize: '12px' }}
            columns={this.state.columns}
            data={this.state.data}
            options={this.state.options}
          />

          <Divider />
          <Button.Group basic size='tiny'>
            <Button onClick={e => this.changeConfig( 'setHeight', 300 )} content='height : 300' />
            <Button onClick={e => this.changeConfig( 'setHeight', 400 )} content='height : 400' />
            <Button onClick={e => this.changeConfig( 'setHeight', 500 )} content='height : 500' />
          </Button.Group>

        </Segment>
      </Container>
    )
  }
}
```