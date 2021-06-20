﻿include(fb.ProfilePath + 'scripts\\SMP\\xxx-scripts\\helpers\\menu_xxx.js');
include(fb.ProfilePath + 'scripts\\SMP\\xxx-scripts\\helpers\\helpers_xxx_file.js');
include(fb.ProfilePath + 'scripts\\SMP\\xxx-scripts\\helpers\\helpers_xxx_tags.js');

const themeMenu = new _menu();

function createThemeMenu(parent) {
	themeMenu.clear(true); // Reset on every call
	const files = findRecursivefile('*.json', [fb.ProfilePath + 'scripts\\SMP\\xxx-scripts\\presets\\Search by\\themes'])
	const properties = parent.buttonsProperties;
	const data = JSON.parse(properties.data[1]);
	// Recipe forced theme?
	let forcedTheme = null;
	if (properties.recipe[1].length) {
		const recipe = _isFile(properties.recipe[1]) ? _jsonParseFile(properties.recipe[1]) : _jsonParseFile(fb.ProfilePath + 'scripts\\SMP\\xxx-scripts\\presets\\Search by\\recipes\\' + properties.recipe[1]);
		if (recipe && recipe.hasOwnProperty('theme')) {
			if (_isFile(recipe.theme)) {forcedTheme = _jsonParseFile(recipe.theme);}
			else if (_isFile(fb.ProfilePath + 'scripts\\SMP\\xxx-scripts\\presets\\Search by\\themes\\' + recipe.theme)) {forcedTheme = _jsonParseFile(fb.ProfilePath + 'scripts\\SMP\\xxx-scripts\\presets\\Search by\\themes\\' + recipe.theme);}
		}
	}
	// Header
	themeMenu.newEntry({entryText: 'Set theme file:', func: null, flags: MF_GRAYED});
	themeMenu.newEntry({entryText: 'sep'});
	themeMenu.newEntry({entryText: 'Open themes folder', func: () => {
		if (_isFile(properties.theme[1])) {_explorer(properties.theme[1]);} // Open current file
		else {_explorer(fb.ProfilePath + 'scripts\\SMP\\xxx-scripts\\presets\\Search by\\themes');} // or folder
	}});
	// Create theme
	themeMenu.newEntry({entryText: 'Create theme file with selected track', func: () => {
		// Tag names
		const genreTag = properties.genreTag[1].split(',').filter(Boolean);
		const styleTag = properties.styleTag[1].split(',').filter(Boolean);
		const moodTag = properties.moodTag[1].split(',').filter(Boolean);
		const dateTag = properties.dateTag[1].split(',').filter(Boolean); // only allows 1 value, but put it into an array
		const composerTag = properties.composerTag[1].split(',').filter(Boolean);
		const customStrTag = properties.customStrTag[1].split(',').filter(Boolean);
		const customNumTag = properties.customNumTag[1].split(',').filter(Boolean); // only allows 1 value, but put it into an array
		// Tag Values
		const selHandleList = new FbMetadbHandleList(fb.GetFocusItem());
		const genre = genreTag.length ? getTagsValuesV3(selHandleList, genreTag, true).flat().filter(Boolean) : [];
		const style = styleTag.length ? getTagsValuesV3(selHandleList, styleTag, true).flat().filter(Boolean) : [];
		const mood = moodTag.length ? getTagsValuesV3(selHandleList, moodTag, true).flat().filter(Boolean) : [];
		const composer = composerTag.length ? getTagsValuesV3(selHandleList, composerTag, true).flat().filter(Boolean) : [];
		const customStr = customStrTag.length ? getTagsValuesV3(selHandleList, customStrTag, true).flat().filter(Boolean) : [];
		const restTagNames = ['key', dateTag.length ? dateTag[0] : 'skip', 'bpm', customNumTag.length ? customNumTag[0] : 'skip']; // 'skip' returns empty arrays...
		const [keyArr, dateArr, bpmArr, customNumArr] = getTagsValuesV4(selHandleList, restTagNames).flat();
		const key = keyArr;
		const date = dateTag.length ? [Number(dateArr[0])] : [];
		const bpm = bpmArr.length ? [Number(bpmArr[0])] : [];
		const customNum = customNumTag.length ? [Number(customNumArr[0])] : [];
		// Theme obj
		let input = '';
		try {input = utils.InputBox(window.ID, 'Enter theme name', 'Search by distance', 'my theme', true);}
		catch (e) {return;}
		if (!input.length) {return;}
		const theme = {name: input, tags: []};
		theme.tags.push({genre, style, mood, key, date, bpm, composer, customStr, customNum});
		const filePath = fb.ProfilePath + 'scripts\\SMP\\xxx-scripts\\presets\\Search by\\themes\\' + input + '.json';
		const bDone = _save(filePath, JSON.stringify(theme, null, '\t'));
		if (!bDone) {fb.ShowPopupMessage('Error saving theme file:' + filePath, 'Search by distance'); return;}
	}, flags: fb.GetFocusItem(true) ? MF_STRING : MF_GRAYED});
	themeMenu.newEntry({entryText: 'sep'});
	themeMenu.newEntry({entryText: 'None', func: () => {
		properties.theme[1] = '';
		const themeName = forcedTheme ? forcedTheme.name + ' (forced by recipe)' : 'None'; // Recipe may overwrite theme
		parent.description = 'Search according to variables at properties.\n(Shift + L. Click to set theme)\t -> ' + themeName + '\n(Ctrl + L. Click to set recipe)\t -> ' + data.recipe + '\n(Shift + Ctrl + L. Click to set other config)';
		data.tooltip = parent.description;
		data.theme = 'None'; // Recipe may overwrite theme
		properties.data[1] = JSON.stringify(data);
		overwriteProperties(properties);
	}});
	themeMenu.newEntry({entryText: 'sep'});
	// All entries
	const tagsToCheck = ['genre', 'style', 'mood', 'key', 'date', 'bpm', 'composer', 'customStr', 'customNum'];
	// List
	const options = [];
	files.forEach((file) => {
		const theme = _jsonParseFile(file);
		if (!theme) {console.log('Recipe file is not valid:' + file); return;}
		// Check
		const tagCheck = theme.hasOwnProperty('tags') ? theme.tags.findIndex((tagArr) => {isArrayEqual(Object.keys(tagArr), tagsToCheck)}) : 0;
		const bCheck = theme.hasOwnProperty('name') && tagCheck === -1;;
		if (!bCheck) {
			console.log('File is not a valid theme: ' + (theme.hasOwnProperty('tags') && tagCheck !== -1 ? [...new Set(tagsToCheck).difference(new Set(Object.keys(theme.tags[tagCheck])))] : file));
			return;
		}
		// List files, with full path or relative path (portable)
		options.push(_isFile(fb.FoobarPath + 'portable_mode_enabled') && file.indexOf(fb.ProfilePath) !== -1 ? file.replace(fb.ProfilePath,'.\\profile\\') : file);
	});
	const menus = [];
	options.forEach((file) => {
		const theme = _jsonParseFile(file);
		const name = forcedTheme ? forcedTheme.name + ' (forced by recipe)' : theme.name; // Recipe may overwrite theme
		let i = 1;
		const entryText = menus.indexOf(theme.name) === -1 ? theme.name : theme.name + ' (' + ++i + ')';
		menus.push(entryText);
		themeMenu.newEntry({entryText, func: () => {
			properties.theme[1] = file;
			parent.description = 'Search according to variables at properties.\n(Shift + L. Click to set theme)\t -> ' + name + '\n(Ctrl + L. Click to set recipe)\t -> ' + data.recipe + '\n(Shift + Ctrl + L. Click to set other config)';
			data.tooltip = parent.description;
			data.theme = theme.name;
			properties.data[1] = JSON.stringify(data);
			overwriteProperties(properties);
		}});
	});
	themeMenu.newCheckMenu(themeMenu.getMainMenuName(), 'None', menus[menus.length - 1], () => {
		const idx = options.indexOf(properties.theme[1]);
		return idx !== -1 ? idx + 1 : 0;
	});
	return themeMenu;
}