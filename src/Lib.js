
const core = require( '@actions/core' );
const { Octokit } = require( '@octokit/rest' );
let octokit = null;

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

  const branch = core.getInput( 'branch' );
  const conclusions = core.getMultilineInput( 'run_conclusions' );
  const savePeriod = timeParse( core.getInput( 'save_period' ) || 90 );
  let saveMinRunsNumber = Number( core.getInput( 'save_min_runs_number' ) ) || null;
  if( saveMinRunsNumber )
  saveMinRunsNumber = Math.ceil( saveMinRunsNumber );
  else
  saveMinRunsNumber = 10;
  const dry = core.getInput( 'dry' ).trim() === 'true';

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
  if( !isNaN( Number( src ) ) )
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
  if( isNaN( result ) )
  throw Error( 'Wrong time format.' )

  return result;
}

//

async function workflowRunsGet( options )
{
  octokit = new Octokit({ auth: options.token });

  let result = [];
  let runs = null;
  let page = 1;
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

function workflowRunsFilter( runs, options )
{
  let result = runs.filter( ( e ) => e.status === 'completed' );

  let savePeriod = Date.now() - options.savePeriod;
  result = result.filter( ( e ) => Date.parse( e.updated_at ) < savePeriod );

  if( options.conclusions && options.conclusions.length )
  result = result.filter( ( e ) => options.conclusions.includes( e.conclusion ) );

  if( options.saveMinRunsNumber )
  result.splice( 0, options.saveMinRunsNumber );

  return result;
}

//

async function workflowRunsClean( runs, options )
{
  if( octokit === null )
  octokit = new Octokit({ auth: options.token });

  if( options.dry )
  for( let i = 0 ; i < runs.length ; i++ )
  {
    const run_id = runs[ i ].id;
    core.debug( `Deleting workflow run #${ run_id } "${ runs[ i ].head_commit.message }"` );
  }
  else
  for( let i = 0 ; i < toRemove.length ; i++ )
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
