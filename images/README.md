# Images Folder

This folder contains screenshots for the Rufus tutorial in the assistant modal.

## Required Screenshots

To complete the assistant, you need to add these screenshots:

1. **rufus-main.png** - Screenshot of Rufus main window showing:
   - Device selection dropdown
   - SELECT button for choosing ISO
   - START button
   - Recommended size: 800x600px

2. **rufus-dd-mode.png** - Screenshot of the DD mode selection dialog showing:
   - "Write in ISO Image mode" option
   - "Write in DD Image mode" option (should be highlighted/selected)
   - Recommended size: 600x400px

## Image Guidelines

- Use PNG format for best quality
- Keep file sizes reasonable (< 500KB per image)
- Add descriptive red arrows or highlights if needed
- Screenshots should be in English (or provide both EN/FR versions)
- Optional: Create a `/fr/` subfolder for French screenshots

## Placeholder Images

For now, the site will work without images. The `<img>` tags have proper alt text for accessibility.

To add your images:
1. Take screenshots following the assistant steps
2. Save them with the exact filenames above
3. Place them in this directory
4. Test the site to ensure they load correctly

## Example Structure

```
images/
├── README.md
├── rufus-main.png
├── rufus-dd-mode.png
└── fr/ (optional)
    ├── rufus-main.png
    └── rufus-dd-mode.png
```
