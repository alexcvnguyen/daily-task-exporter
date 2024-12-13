const { Plugin, PluginSettingTab, Setting, Notice, TFile } = require('obsidian');

class TaskExporterSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Task Exporter Settings' });

        new Setting(containerEl)
            .setName('Output filename')
            .setDesc('Name of the file where tasks will be exported')
            .addText(text => text
                .setPlaceholder('Task List.txt')
                .setValue(this.plugin.settings.outputFileName)
                .onChange(async (value) => {
                    this.plugin.settings.outputFileName = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Exclude folders')
            .setDesc('Comma-separated list of folders to exclude')
            .addText(text => text
                .setValue(this.plugin.settings.excludeFolders)
                .onChange(async (value) => {
                    this.plugin.settings.excludeFolders = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Uncompleted task pattern')
            .setDesc('Regular expression for matching uncompleted tasks')
            .addText(text => text
                .setValue(this.plugin.settings.uncompletedPattern)
                .onChange(async (value) => {
                    this.plugin.settings.uncompletedPattern = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Completed task pattern')
            .setDesc('Regular expression for matching completed tasks. Use {date} to represent today\'s date')
            .addText(text => text
                .setValue(this.plugin.settings.completedPattern)
                .onChange(async (value) => {
                    this.plugin.settings.completedPattern = value;
                    await this.plugin.saveSettings();
                }));
    }
}

const DEFAULT_SETTINGS = {
    outputFileName: 'Task List.txt',
    excludeFolders: '',
    uncompletedPattern: '- \\[ \\] .*',
    completedPattern: '- \\[x\\] .*✅ {date}'
};

class TaskExporter extends Plugin {
    async onload() {
        await this.loadSettings();
        
        this.debounceTimer = null;
        
        this.addSettingTab(new TaskExporterSettingTab(this.app, this));

        this.registerEvent(
            this.app.vault.on('modify', (file) => {
                if (file instanceof TFile && 
                    file.extension === 'md' && 
                    file.name !== this.settings.outputFileName) {
                    this.debouncedExportTasks();
                }
            })
        );

        this.addCommand({
            id: 'export-tasks',
            name: 'Export Tasks Now',
            callback: () => this.exportTasks(),
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    debouncedExportTasks() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            this.exportTasks();
        }, 5000);
    }

    async exportTasks() {
        try {
            const files = this.app.vault.getMarkdownFiles();
            let uncompletedTasks = [];
            let completedTodayTasks = [];
            const today = new Date().toISOString().split('T')[0];

            for (const file of files) {
                if (file.name === this.settings.outputFileName || 
                    this.settings.excludeFolders.split(',')
                        .some(folder => folder.trim() && file.path.toLowerCase().includes(folder.trim().toLowerCase()))) {
                    continue;
                }

                const content = await this.app.vault.cachedRead(file);
                
                const uncompletedMatches = content.match(new RegExp(this.settings.uncompletedPattern, 'g')) || [];
                const completedPattern = this.settings.completedPattern.replace('{date}', today);
                const completedTodayMatches = content.match(new RegExp(completedPattern, 'g')) || [];

                uncompletedTasks.push(...uncompletedMatches);
                completedTodayTasks.push(...completedTodayMatches);
            }

            const tasksText = 
                "Uncompleted Tasks:\n" +
                uncompletedTasks.join("\n") +
                "\n\nCompleted Today:\n" +
                completedTodayTasks.join("\n");

            await this.app.vault.adapter.write(
                this.settings.outputFileName,
                tasksText
            );

            console.log(
                `Exported ${uncompletedTasks.length} uncompleted tasks and ` +
                `${completedTodayTasks.length} tasks completed today to ${this.settings.outputFileName}`
            );

        } catch (error) {
            console.error('Error exporting tasks:', error);
            new Notice('Error exporting tasks. Check console for details.');
        }
    }

    onunload() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
    }
}

module.exports = TaskExporter;ds