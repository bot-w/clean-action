
const _ = require( 'wTools' );
const core = require( '@actions/core' );
const { Octokit } = require( '@octokit/rest' );

async function run()
{
  let token = core.getInput( 'token' );
  if( !token )
  token = process.env.GITHUB_TOKEN;
  if( !token )
  throw Error( 'Expects token. Please add field `token` or set environment variable `GITHUB_TOKEN`.' );

  let repo = core.getInput( 'repo' );
  if( !repo )
  repo = process.env.GITHUB_REPOSITORY;
  throw Error( 'Expects repo in format {owner}/{repo_name}. Please add field `repo`.' );

  const [owner, repo] = repo.split( '/' );
  if( !owner || !repo )

  let branch = core.getInput( 'branch' );
  if( !branch )
  branch = process.env.GITHUB_REF;

  const available_statuses = [ `cancelled`, `skipped`, `timed_out`, `success`, `failure` ];
  let statuses = core.getMultilineInput( 'run_statuses' );

  for( let i = 0 ; i < statuses.length ; i++ )
  {
    if( statuses[ i ] === 'all' )
    {
      statuses = available_statuses;
      break;
    }
    else if( !available_statuses.includes( statuses[ i ] ) )
    {
      throw Error( `Unexpected workflow run status: "${ statuses[ i ] }"` );
    }
  }

  const save_period = core.getMultilineInput( 'save_period' );
  const save_min_runs_number = core.getMultilineInput( 'save_min_runs_number' );
  const dry = core.getMultilineInput( 'dry' );

  /* */

  const octokit = new Octokit({ auth: token });

  const toRemove = [];
  let runs;
  let page = 0;
  do
  {
    const response = await octokit.actions.listWorkflowRunsForRepo
    ({
      owner,
      repo,
      branch,
      per_page: 100,
      page,
    });
    runs = response.data.workflow_runs;
    toRemove.push( ... runs );
    page++;
  }
  while( runs.length === 100 )

  if( statuses.length === 5 )
  filterByTime( toRemove, save_period );
  else
  filterByStatusAndTime( toRemove, save_period, statuses );

  if( dry )
  for( let i = 0 ; i < toRemove.length ; i++ )
  {
    const run_id = toRemove[ i ].id;
    core.debug( `Deleting workflow run #${ run_id } "${ toRemove[ i ].head_commit.message }"` );
  }
  else
  for( let i = 0 ; i < toRemove.length ; i++ )
  {
    const run_id = toRemove[ i ].id;
    core.debug( `Deleting workflow run #${ run_id } "${ toRemove[ i ].head_commit.message }"` );
    await octokit.actions.deleteWorkflowRun
    ({
      owner,
      repo,
      run_id,
    });
  }

  /* */

  // function filterByTime( toRemove, delta )
  // {
  //   if( _.number.is( src ) )
  //   return src;
  // 
  //   const negative = _.str.begins( src, '-' );
  //   if( negative )
  //   src = _.str.removeBegin( src, '-' );
  // 
  //   const parts = src.trim().split( ':' );
  //   _.assert( parts.length <= 3 );
  //   const hours = _.number.from( parts[ 0 ] );
  //   const days = Math.trunc( hours / 24 );
  //   let baseDelta = 86400000 * days;
  //   parts[ 0 ] = hours - ( days * 24 );
  //   return ( baseDelta + Date.parse( `01 Jan 1970 ${ parts.join( ':' ) } GMT` ) ) * ( negative ? -1 : 1 );
  // }
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
