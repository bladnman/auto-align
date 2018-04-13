# Auto-Align

This is an alignment utility that allows for a bit of customization. It will line up assignment operators (`=` and `:` by default) in selected text.


## Features


This system will *not* alter any lines where any of the `non-moveable` items are found to the left of a moveable item.

It is likely you will find scenarios where this does not quite fit your needs with advanced CSS selectors and the likes. You get to set the `moveable` and `non-moveable` in your personal settings file.

You can also define a minimum amount of space you want to see on the left of the moveable items. This is essentially the margin.

```
x = 12;
name = "Dexter";
```
[BECOMES]
```
x      = 12;
name   = "Dexter";
```

You get the idea. This can be done in any language format.


## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `autoalign.moveableItems`: An array of strings of the items which can be moved and aligned
* `autoalign.nonMoveableItems`: An array of string which cannot be moved and will prevent a line from being aligned
* `autoalign.minSeparation`: Minimum amount of white-space placed before the aligned items
* `autoalign.columnWidth`: If this is > 1 then all alignments will be matched up to imaginary columns of this width


## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

Initial release