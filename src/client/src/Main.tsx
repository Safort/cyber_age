import * as React from 'react';
import Game from './Game';

export default class Main extends React.Component {
  componentDidMount() {
    new Game();
  }

  render() {
    return <div className="main" />;
  }
}
