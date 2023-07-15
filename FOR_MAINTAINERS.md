# For Maintainers
This is the documentation that will be used by the maintainers. If you have ideas on how to do things better, please let us know by creating an issue or PR 😉.

- [Labels](#labels)
- [Releasing a new version](#releasing-a-new-version)
- [Generating CHANGELOG.md](#generating-changelogmd)

## Labels
We have several labels that can be used to organize issues and PRs on this repo and also to make the changelog generation easier. All the labels and their descriptions can be [read here](https://github.com/materializecss/materialize/issues/labels). Any other PRs that hasn't labeled with one of these will not be shown on the changelog. Please take a look at the table below

| Label         | Section                  |
|---------------|--------------------------|
| enhancement   | Implemented enhancements |
| bug           | Fixed bugs               |
| documentation | Documentation changes    |
| meta          | Meta changes             |

## Releasing a new version
To fully release a new version, you need to have access to the @materializecss organization on the npmjs. Then, please follow the steps below:

1. In your local copy of Materialize, step into the dev Branch with `git checkout v2-dev` and pull the newest version
   with `git pull origin v2-dev` to have the newest version. Run Tests and check if everything works.

2. Make a new Release branch with `git checkout -b release-2.X.X-alpha`.
   In case something happend or needs to be changed during the release it is better to keep the release on its own branch.

3. Run `npm run release -- --oldver=<current_version> --newver=<new_version>`
   What this command does is that it will replace any occurrences of "<current_version>" with the "<new_version>". So for example, if the current release is `1.0.0`, and then the planned release is `1.1.0`, the command would be
```npm run release -- --oldver=1.0.0 --newver=1.1.0```

4. Verify that version is correctly replaced in:
   * package.json
   * src\global.ts
   * the docs* correctly show the new version `npm run dev`

5. Add Commit with message "chore: release 2.X.X-alpha". Then push to server.

6. Create a Pull Request (PR) ([example](https://github.com/materializecss/materialize/pull/258) so that we can verify nothing goes wrong, address the feedback from the reviewers if there is any

7. Create a new (draft) release on GitHub
   * Generate the Release notes automatically
   * Upload the `materialize-v<new_vversion>.zip` from the bin-folder
   * Create a new tag together with the release

8. Merge the Pull Request after 3 days if there are no concerns and all checks passed.
   * Set the draft release to public.

9. Publish the release on npmjs
   * If you never logged in on npm, please do `npm login` first and enter your credentials
   * Then run `npm publish` and follow the instructions there

10. Done! Yay new version 🥳