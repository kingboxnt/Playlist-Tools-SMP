﻿'use strict';
//24/08/22

function secondsToTime(secs){
	const h = Math.floor(secs / (60 * 60));
	const divisorMinutes = secs % (60 * 60);
	const m = Math.floor(divisorMinutes / 60);
	const divisorSeconds = divisorMinutes % 60;
	const s = Math.ceil(divisorSeconds);
	return `${h ? `${h}h ` : ''}${m ? `${m}min ${s}s` : `${s}s`}`;
}