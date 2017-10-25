# How to contribute to color-indent
First of all, thanks for contributing to this project!

## How can I contribute?

### Reporting bugs
* **Ensure the bug was not already reported** by searching on GitHub under [Issues](https://github.com/victorhqc/color-indent/issues).
* Check the [debugging guide](http://flight-manual.atom.io/hacking-atom/sections/debugging/) for Atom. You might be able to find the cause of the problem and fix things yourself. Most importantly, check if you can reproduce the problem in the latest version of Atom, if the problem happens when you run Atom in safe mode, and if you can get the desired behavior by changing Atom's or packages' config settings.
* **Use a clear and descriptive title** for the issue to identify the problem.
* **Describe the exact steps which reproduce the problem** in as many details as possible. For example, start by explaining how you started Atom, e.g. which command exactly you used in the terminal, or how you started Atom otherwise. When listing steps, **don't just say what you did, but explain how you did it**. For example, if you moved the cursor to the end of a line, explain if you used the mouse, or a keyboard shortcut or an Atom command, and if so which one?
* **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
* **Explain which behavior you expected to see instead and why.**
* **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem. If you use the keyboard while following the steps, **record the GIF with the [Keybinding Resolver](https://github.com/atom/keybinding-resolver) shown**. You can use [this tool](http://www.cockos.com/licecap/) to record GIFs on macOS and Windows, and [this tool](https://github.com/colinkeenan/silentcast) or [this tool](https://github.com/GNOME/byzanz) on Linux.

### Code contribution

#### Local development
All packages can be developed locally. For instructions on how to do this, see [Contributing to Official Atom Packages][contributing-to-official-atom-packages] in the [Atom Flight Manual](http://flight-manual.atom.io).

#### Pull Requests
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible.
* Follow the [JavaScript](https://github.com/airbnb/javascript) Styleguide
* Include thoughtfully-worded, well-structured [Jasmine](http://jasmine.github.io/) specs in the `./spec` folder. Run them using `atom --test spec`.

[contributing-to-official-atom-packages]:http://flight-manual.atom.io/hacking-atom/sections/contributing-to-official-atom-packages/
