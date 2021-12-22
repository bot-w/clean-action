
const core = require( '@actions/core' );
const { Octokit } = require( '@octokit/rest' );

//

function actionOptionsGet()
{
  let token = core.getInput( 'token' );
  if( !token )
  token = process.env.GITHUB_TOKEN;
  if( !token )
  throw Error( 'Expects token. Please add field `token` or set environment variable `GITHUB_TOKEN`.' );

  let repoRef = core.getInput( 'repo' );
  if( !repoRef )
  repoRef = process.env.GITHUB_REPOSITORY;
  if( !repoRef )
  throw Error( 'Expects repo in format {owner}/{repo_name}. Please add field `repo`.' );

  const splits = repoRef.split( '/' );
  const owner = splits[ 0 ];
  const repo = splits[ 1 ];
  if( !owner || !repo || splits.length > 2 )
  throw Error( 'Expects repo in format {owner}/{repo_name}. Please add field `repo`.' );

  let branch = core.getInput( 'branch' );
  if( !branch )
  branch = process.env.GITHUB_REF;

  const conclusions = core.getMultilineInput( 'run_conclusions' );
  const savePeriod = timeParse( core.getMultilineInput( 'save_period' ) );
  const saveMinRunsNumber = core.getMultilineInput( 'save_min_runs_number' );
  const dry = core.getMultilineInput( 'dry' );

  const options = 
  {
    token,
    owner,
    repo,
    branch,
    conclusions,
    savePeriod,
    saveMinRunsNumber,
    dry,
  };

  return options;
}

//

function timeParse( src )
{
  if( typeof( src ) === 'number' )
  return src * 86400000;

  if( typeof( src ) !== 'string' )
  throw Error( 'Unsupported time type. Please, set number of days as number or time in format "hh:mm:ss".' );

  const parts = src.trim().split( ':' );
  if( parts.length !== 3 )
  throw Error( 'Unsupported time format. Please set time in format: "hh:mm:ss"' );

  const hours = Number( parts[ 0 ] );
  const days = Math.trunc( hours / 24 );

  let baseDelta = 86400000 * days;
  parts[ 0 ] = hours - ( days * 24 );
  const result = baseDelta + Date.parse( `01 Jan 1970 ${ parts.join( ':' ) } GMT` );
  if( isNan( result ) )
  throw Error( 'Wrong time format.' )

  return result;
}

//

function workflowRunsGet( options )
{
  const octokit = new Octokit({ auth: options.token });

  let result = [];
  let runs = null;
  let page = 0;
  do
  {
    const response = await octokit.actions.listWorkflowRunsForRepo
    ({
      owner : options.owner,
      repo : options.repo,
      branch : options.branch,
      per_page: 100,
      page,
    });
    runs = response.data.workflow_runs;
    result.push( ... runs );
    page++;
  }
  while( runs.length === 100 )

  return result;
}

//

function workflowRunsFilter( runs )
{
  /* filter not completed */
  let result = runs.filter( ( e ) => e.status === 'completed' );

  /* filter by time */
  let savePeriod = Date.now() - options.savePeriod;
  result = result.filter( ( e ) => Date.parse( e.updated_at ) < savePeriod );

  /* filter by conclusions */
  if( options.conclusions && options.conclusions.length )
  toRemove = toRemove.filter( ( e ) => options.conclusions.includes( e.conclusion ) );

  if( !options.saveMinRunsNumber )
  options.saveMinRunsNumber = 10;

  return result;
}

//

async function workflowRunsClean( runs, options )
{
  if( options.dry )
  for( let i = options.saveMinRunsNumber ; i < runs.length ; i++ )
  {
    const run_id = runs[ i ].id;
    core.debug( `Deleting workflow run #${ run_id } "${ runs[ i ].head_commit.message }"` );
  }
  else
  for( let i = options.saveMinRunsNumber ; i < toRemove.length ; i++ )
  {
    const run_id = runs[ i ].id;
    core.debug( `Deleting workflow run #${ run_id } "${ runs[ i ].head_commit.message }"` );
    await octokit.actions.deleteWorkflowRun
    ({
      owner : options.owner,
      repo : options.repo,
      run_id,
    });
  }

  return runs;
}

//

const Self =
{
  actionOptionsGet,
  timeParse,
  workflowRunsGet,
  workflowRunsFilter,
  workflowRunsClean,
};

//

module.exports = Self;
