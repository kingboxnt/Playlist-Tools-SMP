﻿'use strict';
//26/07/22

/* 
	Search n tracks (randomly) on library matching at least 2 styles and 6 moods from the current selected track.
	You can configure the number of tracks at properties panel. Also forced query to prefilter tracks.
 */

include('..\\helpers\\buttons_xxx.js');
include('..\\main\\search_same_style_moods.js');
include('..\\helpers\\helpers_xxx_properties.js');
include('..\\helpers\\buttons_xxx_menu.js');
var prefix = 'ss_';
 
try {window.DefinePanel('Search Similar Button', {author:'xxx'});} catch (e) {/* console.log('Same Styles/Moods Button loaded.'); */} //May be loaded along other buttons
prefix = getUniquePrefix(prefix, ''); // Puts new ID before '_'

var newButtonsProperties = { //You can simply add new properties here
	playlistLength:	 ['Max Playlist Mix length', 50],
	forcedQuery:	 ['Forced query to filter database', 'NOT (%rating% EQUAL 2 OR %rating% EQUAL 1) AND NOT (STYLE IS Live AND NOT STYLE IS Hi-Fi) AND %channels% LESS 3 AND NOT COMMENT HAS Quad'],
	styleTag:		 ['Style tag', 'style'],
	moodTag:		 ['Mood tag', 'mood']
};
newButtonsProperties['playlistLength'].push({greater: 0, func: isInt}, newButtonsProperties['playlistLength'][1]);
newButtonsProperties['forcedQuery'].push({func: (query) => {return checkQuery(query, true);}}, newButtonsProperties['forcedQuery'][1]);

setProperties(newButtonsProperties, prefix, 0); //This sets all the panel properties at once
newButtonsProperties = getPropertiesPairs(newButtonsProperties, prefix, 0);
buttonsBar.list.push(newButtonsProperties);

addButton({
	'Same Styles/Moods': new themedButton({x: 0, y: 0, w: 133, h: 22}, 'Same Styles/Moods', function (mask) {
		if (mask === MK_SHIFT) {
			settingsMenu(this, true).btn_up(this.currX, this.currY + this.currH);
		} else {
			do_search_same_style_moods({playlistLength: this.buttonsProperties.playlistLength[1], forcedQuery: this.buttonsProperties.forcedQuery[1], styleTag: this.buttonsProperties.styleTag[1], moodTag: this.buttonsProperties.moodTag[1]});
		}
	}, null, void(0), () => {
		const bShift = utils.IsKeyPressed(VK_SHIFT);
		const bInfo = typeof menu_panelProperties === 'undefined' || menu_panelProperties.bTooltipInfo[1];
		let info = 'Random playlist matching at least 2 styles and 6 moods\nof the currently selected track';
		if (bShift || bInfo) {
			info += '\n-----------------------------------------------------';
			info += '\n(Shift + L. Click to open config menu)';
		}
		return info;
	}, prefix, newButtonsProperties, chars.link),
});