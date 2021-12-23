
'use strict';

const _ = require( 'wTesting' );
const core = require( '@actions/core' );
const action = require( '../src/Lib.js' );

//--
// tests
//--

function actionOptionsGet( test )
{
  const originalToken = process.env.GITHUB_TOKEN;
  const originalRepo = process.env.GITHUB_REPOSITORY;
  const originalBranch = process.env.GITHUB_REF;

  process.env.GITHUB_TOKEN = 'abc';
  process.env.GITHUB_REPOSITORY = 'user/repo';
  process.env.GITHUB_REF = 'custom';

  /* - */

  test.case = 'all default except save_period, save_period - number of days';
  var got = action.actionOptionsGet();
  var exp =
  {
    token : 'abc',
    owner : 'user',
    repo : 'repo',
    branch : 'custom',
    conclusions : [],
    savePeriod : 7776000000,
    saveMinRunsNumber : null,
    dry : false,
  };
  test.identical( got, exp );

  test.case = 'all default except save_period, save_period - number of days';
  core.exportVariable( `INPUT_SAVE_PERIOD`, 1 );
  var got = action.actionOptionsGet();
  var exp =
  {
    token : 'abc',
    owner : 'user',
    repo : 'repo',
    branch : 'custom',
    conclusions : [],
    savePeriod : 86400000,
    saveMinRunsNumber : null,
    dry : false,
  };
  test.identical( got, exp );
  delete process.env.INPUT_SAVE_PERIOD;

  test.case = 'all default except save_period, save_period - time';
  core.exportVariable( `INPUT_SAVE_PERIOD`, '01:00:00' );
  var got = action.actionOptionsGet();
  var exp =
  {
    token : 'abc',
    owner : 'user',
    repo : 'repo',
    branch : 'custom',
    conclusions : [],
    savePeriod : 3600000,
    saveMinRunsNumber : null,
    dry : false,
  };
  test.identical( got, exp );
  delete process.env.INPUT_SAVE_PERIOD;

  /* */

  test.case = 'not default token';
  core.exportVariable( `INPUT_TOKEN`, 'bar' );
  var got = action.actionOptionsGet();
  var exp =
  {
    token : 'bar',
    owner : 'user',
    repo : 'repo',
    branch : 'custom',
    conclusions : [],
    savePeriod : 7776000000,
    saveMinRunsNumber : null,
    dry : false,
  };
  test.identical( got, exp );
  delete process.env.INPUT_TOKEN;

  test.case = 'not default repo';
  core.exportVariable( `INPUT_REPO`, 'some-user/repository' );
  var got = action.actionOptionsGet();
  var exp =
  {
    token : 'abc',
    owner : 'some-user',
    repo : 'repository',
    branch : 'custom',
    conclusions : [],
    savePeriod : 7776000000,
    saveMinRunsNumber : null,
    dry : false,
  };
  test.identical( got, exp );
  delete process.env.INPUT_REPO;

  test.case = 'not default branch';
  core.exportVariable( `INPUT_BRANCH`, 'complex/branch' );
  var got = action.actionOptionsGet();
  var exp =
  {
    token : 'abc',
    owner : 'user',
    repo : 'repo',
    branch : 'complex/branch',
    conclusions : [],
    savePeriod : 7776000000,
    saveMinRunsNumber : null,
    dry : false,
  };
  test.identical( got, exp );
  delete process.env.INPUT_BRANCH;

  /* */

  test.case = 'not default conclusions, single item';
  core.exportVariable( `INPUT_RUN_CONCLUSIONS`, 'one' );
  var got = action.actionOptionsGet();
  var exp =
  {
    token : 'abc',
    owner : 'user',
    repo : 'repo',
    branch : 'custom',
    conclusions : [ 'one' ],
    savePeriod : 7776000000,
    saveMinRunsNumber : null,
    dry : false,
  };
  test.identical( got, exp );
  delete process.env.INPUT_RUN_CONCLUSIONS;

  test.case = 'not default conclusions, several item';
  core.exportVariable( `INPUT_RUN_CONCLUSIONS`, 'one\ntwo' );
  var got = action.actionOptionsGet();
  var exp =
  {
    token : 'abc',
    owner : 'user',
    repo : 'repo',
    branch : 'custom',
    conclusions : [ 'one', 'two' ],
    savePeriod : 7776000000,
    saveMinRunsNumber : null,
    dry : false,
  };
  test.identical( got, exp );
  delete process.env.INPUT_RUN_CONCLUSIONS;

  /* */

  test.case = 'not default save_min_runs_number, invalid';
  core.exportVariable( `INPUT_SAVE_MIN_RUNS_NUMBER`, 'abc' );
  var got = action.actionOptionsGet();
  var exp =
  {
    token : 'abc',
    owner : 'user',
    repo : 'repo',
    branch : 'custom',
    conclusions : [],
    savePeriod : 7776000000,
    saveMinRunsNumber : null,
    dry : false,
  };
  test.identical( got, exp );
  delete process.env.INPUT_SAVE_MIN_RUNS_NUMBER;

  test.case = 'not default save_min_runs_number, integer';
  core.exportVariable( `INPUT_SAVE_MIN_RUNS_NUMBER`, 1 );
  var got = action.actionOptionsGet();
  var exp =
  {
    token : 'abc',
    owner : 'user',
    repo : 'repo',
    branch : 'custom',
    conclusions : [],
    savePeriod : 7776000000,
    saveMinRunsNumber : 1,
    dry : false,
  };
  test.identical( got, exp );
  delete process.env.INPUT_SAVE_MIN_RUNS_NUMBER;

  test.case = 'not default save_min_runs_number, double';
  core.exportVariable( `INPUT_SAVE_MIN_RUNS_NUMBER`, 1.1 );
  var got = action.actionOptionsGet();
  var exp =
  {
    token : 'abc',
    owner : 'user',
    repo : 'repo',
    branch : 'custom',
    conclusions : [],
    savePeriod : 7776000000,
    saveMinRunsNumber : 2,
    dry : false,
  };
  test.identical( got, exp );
  delete process.env.INPUT_SAVE_MIN_RUNS_NUMBER;

  /* */

  test.case = 'not default dry, invalid';
  core.exportVariable( `INPUT_DRY`, 'some' );
  var got = action.actionOptionsGet();
  var exp =
  {
    token : 'abc',
    owner : 'user',
    repo : 'repo',
    branch : 'custom',
    conclusions : [],
    savePeriod : 7776000000,
    saveMinRunsNumber : null,
    dry : false,
  };
  test.identical( got, exp );
  delete process.env.INPUT_DRY;

  test.case = 'not default dry, true';
  core.exportVariable( `INPUT_DRY`, 'true' );
  var got = action.actionOptionsGet();
  var exp =
  {
    token : 'abc',
    owner : 'user',
    repo : 'repo',
    branch : 'custom',
    conclusions : [],
    savePeriod : 7776000000,
    saveMinRunsNumber : null,
    dry : true,
  };
  test.identical( got, exp );
  delete process.env.INPUT_DRY;

  /* - */

  if( Config.debug )
  {
    test.case = 'no token, no repo, no branch, no environments';
    delete process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_REPOSITORY;
    delete process.env.GITHUB_REF;
    test.shouldThrowErrorSync( () => action.actionOptionsGet() );

    test.case = 'no token';
    delete process.env.GITHUB_TOKEN;
    process.env.GITHUB_REPOSITORY = 'user/branch';
    process.env.GITHUB_REF = 'custom';
    test.shouldThrowErrorSync( () => action.actionOptionsGet() );

    test.case = 'no repo';
    process.env.GITHUB_TOKEN = 'abc';
    delete process.env.GITHUB_REPOSITORY;
    process.env.GITHUB_REF = 'custom';
    test.shouldThrowErrorSync( () => action.actionOptionsGet() );

    test.case = 'no branch';
    process.env.GITHUB_TOKEN = 'abc';
    process.env.GITHUB_REPOSITORY = 'user/repo';
    delete process.env.GITHUB_REF;
    test.shouldThrowErrorSync( () => action.actionOptionsGet() );

    test.case = 'invalid repo format';
    process.env.GITHUB_TOKEN = 'abc';
    process.env.GITHUB_REF = 'custom';
    process.env.GITHUB_REPOSITORY = 'user';
    test.shouldThrowErrorSync( () => action.actionOptionsGet() );
    process.env.GITHUB_REPOSITORY = 'user:repo';
    test.shouldThrowErrorSync( () => action.actionOptionsGet() );
    process.env.GITHUB_REPOSITORY = 'user/';
    test.shouldThrowErrorSync( () => action.actionOptionsGet() );
    process.env.GITHUB_REPOSITORY = '/repo';
    test.shouldThrowErrorSync( () => action.actionOptionsGet() );
    process.env.GITHUB_REPOSITORY = 'user/repo/';
    test.shouldThrowErrorSync( () => action.actionOptionsGet() );
    process.env.GITHUB_REPOSITORY = 'user/repo/sub';
    test.shouldThrowErrorSync( () => action.actionOptionsGet() );
  }

  /* */

  process.env.GITHUB_TOKEN = originalToken;
  process.env.GITHUB_REPOSITORY = originalRepo;
  process.env.GITHUB_REF = originalBranch;
}

// --
// declare
// --

const Proto =
{
  name : 'Lib',
  silencing : 1,
  enabled : 1,

  tests :
  {
    actionOptionsGet,
  },
};

const Self = wTestSuite( Proto );
if( typeof module !== 'undefined' && !module.parent )
wTester.test( Self.name );

