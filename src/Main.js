
const action = require( './Lib.js' );

//

action.actionCleanRun()
.then( ( e ) =>
{
  return e;
})
.catch( ( err ) =>
{
  core.setFailed( err.message );
});

