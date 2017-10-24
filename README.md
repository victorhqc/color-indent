# color-indent
![Build Status](https://img.shields.io/circleci/project/github/victorhqc/color-indent/master.svg) ![License](https://img.shields.io/apm/l/color-indent.svg) ![Version](https://img.shields.io/apm/v/color-indent.svg) ![Downloads](https://img.shields.io/apm/dm/color-indent.svg)

Use colors to show in a non intrusive manner different indentation levels.

![Color Indent](https://i.imgur.com/eHSmMhf.png)

## Installation

You can install via `apm`:
```sh
apm install color-indent
```

Or, just search for `color-indent` inside Atom's package panel.

## Features
I once saw something like this some years ago. Unfortunately I don't remember where, but since I
always wanted it, I'm building it now.

- Choose from preconfigured colors
- Choose width from preconfigured set
- Configure your own color and width with a `custom` style.
- Toggle colors.

## Configuration
Unfortunately, the Atom API limits the specific markers for this plugin, so the easiest way to set
this style was with a static `stylesheet`.

1. Choose one of the preconfigured color in the Package configuration.
2. Create your own set of colors by adding something like this in `Atom -> Stylesheet...` and then
choose the `custom` option in the package configuration for `colors`.
```less
.color-indent {
  &.color-indent-0 {
    &.custom {
      border-right-color: #bce784;
    }
  }

  &.color-indent-1 {
    &.custom {
      border-right-color: #5dd39e;
    }
  }

  &.color-indent-2 {
    &.custom {
      border-right-color: #348aa7;
    }
  }

  &.color-indent-3 {
    &.custom {
    border-right-color: #525174;
    }
  }

  &.color-indent-4 {
    &.custom {
      border-right-color: #513b56;
    }
  }
}
```
2. Create your own width by adding something like this in `Atom -> Stylesheet...` and then
choose the `custom` option in the package configuration for `width`.
```less
.color-indent {
  &.color-indent-width-custom {
    border-right-width: 6px;
  }
}
```

### Gutter
![No space](https://i.imgur.com/7Vtbkrm.png)

Some packages, like `eslint` create a Gutter in Atom. That means that the style for `color-indent`
and the actual code have a space between each other. However, if there are no packages that do this, you can
enable this to add an space and avoid having this problem.

![With space](https://i.imgur.com/ZUl3LnQ.png)

If you want, you can even change the gutter style like this in `Atom -> Stylesheet...`
```less
.gutter[gutter-name="color-indent"] {
    min-width: 10px;
}
```

## Usage
Just type and see how the tabulation color is filled.

![Color Indent animation](https://i.imgur.com/q22vBZ5.gif)

You can also toggle the colors if you need to deactivate it or reactivate it quickly.
Go to the Atom Command Palette and choose `color-indent: toggle`.
