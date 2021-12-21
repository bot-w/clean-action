
'use strict';

const _ = require( 'wTesting' );
const action = require( '../src/Lib.js' );

//--
// tests
//--

function actionCleanRun( test )
{
  test.true( _.routine.is( action.actionCleanRun ) );
}

// --
// declare
// --

const Proto =
{
  name : 'Action',
  silencing : 1,
  enabled : 1,

  tests :
  {
    actionCleanRun,
  },
};

const Self = wTestSuite( Proto );
if( typeof module !== 'undefined' && !module.parent )
wTester.test( Self.name );

