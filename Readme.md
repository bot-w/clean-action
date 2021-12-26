
# clean-workflow-runs [![status](https://github.com/dmvict/clean-workflow-runs/actions/workflows/Publish.yml/badge.svg)](https://github.com/dmvict/clean-workflow-runs/actions/workflows/Publish.yml) [![stable](https://img.shields.io/badge/stability-stable-brightgreen.svg)](https://github.com/emersion/stability-badges#stable)

Flexible and configurable action for removing completed workflow runs.

## Why

Current actions provide less features and it can be unusable in some cases.

## Inputs

### `token`

A personal access token.

Default: environment variable `GITHUB_TOKEN`.

### `repo`

A repository from which delete workflow runs. Default is current repository.

Format of field : `{owner}/{repo_name}`.

Default: current repository.

### `branch`

A branch from which delete workflow runs. Default is all branches..

Default: all branches.

### `run_conclusions`

Filter for workflow runs conclusion. Accepts all available conclusions.

_Note:_ : if filter is not defined, then action filters runs by time.

### `save_period`

Determines period in which the workflow runs will be saved.

The input should be a string in format `hh:mm:ss`.

Default: 90 days.

### `save_min_runs_number`

A minimal number of completed runs which will be saved.

Default: 10 runs.

### `dry`

Enables dry run of action. Action will print the list of workflow runs to delete.

Default: false.

## Example of usage

```yaml
uses: dmvict/clean-workflow-runs@v1.0.0
with:
  token: ${{ secrets.GITHUB_TOKEN }}
  repo: dmvict/clean-workflow-runs
  branch: dev
  run_conclusions: |
    cancelled
    skipped
  save_period: '15:00:00'
```
