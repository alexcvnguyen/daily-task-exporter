# Daily Task Exporter

My first Obsidian plugin! This plugin helps you keep track of your tasks by exporting them to a separate file. It's pretty simple - it just looks for checkbox tasks in your notes and appends them to a text file.

It's basically a manual API to make daily tasks and task completion accessible to other progrms. In an ideal world, the Tasks plugin or Dataview plugin could summarise all this data and save it to a text file, but unfortunately not.

Hope somebody finds this useful!!!

## What it does

- Finds all your tasks (both checked and unchecked)
- Puts them in a separate file
- Updates automatically when you change your notes
- Lets you exclude certain folders
- Allows you to filter based on regex

## How to use it

1. Install the plugin
2. Go to settings to set up:
   - What file to save tasks in
   - Which folders to skip
   - What your tasks look like (if you use something different from the normal checkboxes)

The plugin will create a file (default is "Task List.txt") with all your tasks.

## Settings

- Output filename: Where to save the tasks
- Exclude folders: Folders you want to skip
- Task patterns: How to find your tasks (it's using regex but the defaults should work fine)

## Thank you!

This is my first plugin, so any feedback would be really appreciated! 

## Installing

- Download the files from the latest release
- Put them in your vault's `.obsidian/plugins/daily-task-exporter/` folder
- Enable the plugin in Obsidian settings

## License

MIT License - feel free to use it however you want!