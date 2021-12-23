
const action = require( './Lib.js' );

//

async function run()
{
  const options = action.actionOptionsGet();
  const runs = await action.workflowRunsGet( options );
  const filtered = action.workflowRunsFilter( runs );
  return action.actionCleanRun( filtered, options );
}

run()
.then( ( e ) =>
{
  return e;
})
.catch( ( err ) =>
{
  core.setFailed( err.message );
});
