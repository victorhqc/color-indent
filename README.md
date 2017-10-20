# color-indent
Use colors to show in a non intrusive manner different indentation levels.

![Color Indent](https://i.imgur.com/eHSmMhf.png)

## Features
I once saw something like this some years ago. Unfortunately I don't remember where, but since I
always wanted it, I'm building it now.

- Choose from preconfigured colors
- Configure your own color with the `custom` preset.
- Toggle colors.

## Configuration
Unfortunately, the Atom API limits the specific markers for this plugin, so the easiest way to set this style was with a static `stylesheet`.

1. Choose one of the preconfigured color in the Package configuration.
2. Create your own set of colors by adding something like this in `Atom -> Stylesheet...` and then choose the `custom` option in the package configuration. (Perhaps you'll need to restart Atom).
```css
.color-indent {
  &.color-indent-0 {
    &.custom {
      border-right: 5px solid #bce784;
    }
  }

  &.color-indent-1 {
    &.custom {
      border-right: 5px solid #5dd39e;
    }
  }

  &.color-indent-2 {
    &.custom {
      border-right: 5px solid #348aa7;
    }
  }

  &.color-indent-3 {
    &.custom {
      border-right: 5px solid #525174;
    }
  }

  &.color-indent-4 {
    &.custom {
      border-right: 5px solid #513b56;
    }
  }
}
```

## Usage
Just type and see how the tabulation color is filled.

![Color Indent animation](https://i.imgur.com/q22vBZ5.gif)

You can also toggle the colors if you need to deactivate it or reactivate it quickly. Go to the Atom Command Palette and choose `color-indent: toggle`.
