/**
 * MIT licenced
 *
 * v0.1.1
 * 2017-04-06
 */

/*
 *
 * code outline:
 *
 * imports
 * global data
 * page load
 * main chain
 * feedback
 * types
 * buttons
 * util
 * data cleaning
 * url query manipulation
 * api urls
 * test(ing) stuff
 *
 */


//  ██╗███╗   ███╗██████╗  ██████╗ ██████╗ ████████╗███████╗
//  ██║████╗ ████║██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝
//  ██║██╔████╔██║██████╔╝██║   ██║██████╔╝   ██║   ███████╗
//  ██║██║╚██╔╝██║██╔═══╝ ██║   ██║██╔══██╗   ██║   ╚════██║
//  ██║██║ ╚═╝ ██║██║     ╚██████╔╝██║  ██║   ██║   ███████║
//  ╚═╝╚═╝     ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝


//
// imports
//

//import animelistTL.ts
import {
    AnimeListTimeline, //
    AnimeListTimelineConfig, AnimeListTimelineConfigKeys, //
    NoDatedAnimeError
} from "./src/animelistTL.js";

import * as ATL from "./src/animelistTL.js";


//import MAL.ts
import * as MAL from "./src/MAL.js";

//import timeline.ts
import { Timeline } from "./lib/timeline.js";


//import jquery
import "./jquery.js";
import "./lib/jquery-ui/jquery-ui.min.js";


//import FileSaver.js
declare function saveAs(foo?, fooo?);
// console.info("init FileSaver???");
// console.info(saveAs);

// Deprecated or something?
declare function unescape(s: string): string;


//  ██████╗ ██╗      ██████╗ ██████╗  █████╗ ██╗     ███████╗    
// ██╔════╝ ██║     ██╔═══██╗██╔══██╗██╔══██╗██║     ██╔════╝    
// ██║  ███╗██║     ██║   ██║██████╔╝███████║██║     ███████╗    
// ██║   ██║██║     ██║   ██║██╔══██╗██╔══██║██║     ╚════██║    
// ╚██████╔╝███████╗╚██████╔╝██████╔╝██║  ██║███████╗███████║    
//  ╚═════╝ ╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝    


//
// Global data
//

export const debug: boolean = false;
// export const debug: boolean = true

// Just throw things into this bag. It'll be fine.
export let debugData = {};

export const usingTestData: boolean = false;
// export const usingTestData: boolean = true

if (debug || usingTestData) {
    console.warn("Don't commit debug!");
}

//
//


const siteUrl: string = "https://linkviii.github.io/js-animelist-timeline/";
const repoUrl: string = "https://github.com/linkviii/js-animelist-timeline";
const issueUrl: string = "https://github.com/linkviii/js-animelist-timeline/issues";

const dateRegex = /^\d\d\d\d[\-\/.]\d\d[\-\/\.]\d\d$|^\d\d\d\d\d\d\d\d$/;


const userAnimeCache: Map<string, MAL.AnimeList | MAL.BadUsernameError> = new Map();
const userMangaCache: Map<string, MAL.MangaList | MAL.BadUsernameError> = new Map();
let timelineCount: number = 0;


// global for ease of testing. Used as globals.
// export let username: string;
// export let tln: AnimeListTimeline;

// ██████╗  █████╗  ██████╗ ███████╗    ██╗      ██████╗  █████╗ ██████╗ 
// ██╔══██╗██╔══██╗██╔════╝ ██╔════╝    ██║     ██╔═══██╗██╔══██╗██╔══██╗
// ██████╔╝███████║██║  ███╗█████╗      ██║     ██║   ██║███████║██║  ██║
// ██╔═══╝ ██╔══██║██║   ██║██╔══╝      ██║     ██║   ██║██╔══██║██║  ██║
// ██║     ██║  ██║╚██████╔╝███████╗    ███████╗╚██████╔╝██║  ██║██████╔╝
// ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝    ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ 


//
// Page load
//

function init(): void {

    if (usingTestData) {
        const warn = document.createElement("h1");
        warn.textContent = "Using test data !!!";
        document.getElementById("top").prepend(warn);
    }

    const keys = AnimeListTimelineConfigKeys;

    // form fields
    const param = getJsonFromUrl();

    const listField = $("#listName");
    listField.select();
    const width = $("#width") as JQuery<HTMLInputElement>;
    const from = $("#from") as JQuery<HTMLInputElement>;
    const to = $("#to") as JQuery<HTMLInputElement>;
    const focus = $("#focus-year") as JQuery<HTMLInputElement>;
    const listKind = $("#list-kind") as JQuery<HTMLInputElement>;

    const animeFormat = $("#anime-format");
    const mangaFormat = $("#manga-format");

    if (param[keys.userName]) {
        listField.val(param[keys.userName]);
    }
    if (param[keys.width]) {
        width.val(param[keys.width]);
    }
    if (param[keys.minDate]) {
        from.val(param[keys.minDate]);
    }
    if (param[keys.maxDate]) {
        to.val(param[keys.maxDate]);
    }
    if (param[keys.lang]) {
        $("#language").val(param[keys.lang]);
    }
    if (param[keys.seasons]) {
        ($("#seasons")[0] as HTMLInputElement).checked = "true" == param[keys.seasons];
    }
    if (param[keys.listKind]) {
        listKind.val(param[keys.listKind]);
    }
    if (param[keys.fontSize]) {
        $("#font-size").val(param[keys.fontSize]);
    }

    //
    const showMediaKinds = function (kind: string) {

        switch (kind) {
            case "ANIME":
                animeFormat.show();
                mangaFormat.hide();
                break;
            case "MANGA":
                animeFormat.hide();
                mangaFormat.show();
                break;
            default:
                console.error("Unexpected list-kind:", kind);

        }

    };

    showMediaKinds(<string>listKind.val());

    listKind.on("change", (e: Event) => showMediaKinds((<any>e.target).value));

    // Default focus to be cleared. No state to be preserved.
    focus.val("");

    //

    // Center to and from around this year
    focus.on("change", function (e) {
        if (this.value.length != 4) return;

        const y = parseInt(this.value);
        const y0 = (y - 1).toString();
        const y1 = (y + 1).toString();

        from.val(`${y0}-12-01`);
        to.val(`${y1}-02-01`);

    });

    // Snap to the current year when first focused
    focus.on("click", function (e) {
        if (this.value.length != 4) {
            this.value = new Date().getFullYear().toString();
        }
    });

    // Invalidate focus if dates are otherwise modified
    to.on("change", function (e) {
        focus.val("");
    });

    from.on("change", function (e) {
        focus.val("");
    });


    // Use jqueary-ui to make number input with steps that aren't validated
    (<any>width).spinner({
        step: 100,
    });



    //
    const widthSlider = $("#width-slider") as JQuery<HTMLInputElement>;
    widthSlider.on("change", function (e) {
        let val = parseInt(this.value) / 100 * $(this).width();
        val = Math.ceil(val);
        // $("#width-disp").text(val);

        width.val(val);
    });

    width.on("spin", function (event, ui) {
        const percentWidth = Math.floor(parseInt(ui.value) / widthSlider.width() * 100);
        // const percentWidth = Math.floor(parseInt(this.value) / widthSlider.width() * 100);
        widthSlider.val(percentWidth.toString());

    });

    const percentWidth = Math.floor(parseInt(<string>width.val()) / widthSlider.width() * 100);
    // console.log(percentWidth, "%")

    widthSlider.val(percentWidth.toString());


    //

    //buttons
    $("#listFormSubmit")[0].addEventListener("click", listFormSubmit);

    const removeAll = <HTMLButtonElement>document.getElementById("clearAllTimelines");
    removeAll.disabled = true;
    removeAll.addEventListener("click", clearAllTimelines);

}


$(document).ready(init);

/*  
 *
 * --------------------------------
 *
 *
 */

//  ██╗     ██╗███████╗████████╗███████╗
//  ██║     ██║██╔════╝╚══██╔══╝██╔════╝
//  ██║     ██║███████╗   ██║   ███████╗
//  ██║     ██║╚════██║   ██║   ╚════██║
//  ███████╗██║███████║   ██║   ███████║
//  ╚══════╝╚═╝╚══════╝   ╚═╝   ╚══════╝



export async function getAniList(userName: string): Promise<any | MAL.BadUsernameError> {

    if (usingTestData) {
        console.warn("Using test data.");
        giveFeedback("Using test data");

        const url = "res/anilist_example.json";

        let job = await fetch(url).then(response => response.json());
        return job;

    }

    const query = `
    query ($userName: String) { 
        MediaListCollection(userName: $userName, type: ANIME) {
            hasNextChunk
            user {
                id
            }
            lists {
                name
                status
                entries {
                    mediaId
                    score
                    progress
                    startedAt { year month day } 
                    completedAt { year month day }
                    media {
                        duration
                        episodes
                        format
                        title {
                            romaji english native userPreferred
                        }
                    }
                }
            }
        }
    }
    `; // Could probably munch the whitespace with a regex but no real need to

    const variables = {
        userName: userName
    };


    // Define the config we'll need for our Api request
    const url = 'https://graphql.anilist.co',
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        };


    const response = await fetch(url, options);
    const foo = await response.json();

    if (foo.errors) {
        console.error(foo.errors);
        return new MAL.BadUsernameError();
    }

    const data = foo.data.MediaListCollection;

    if (data.hasNextChunk) {
        console.warn("TODO: next chunk not implemented yet.");
    }


    return data;

}





export async function getMangaList(userName: string): Promise<any | MAL.BadUsernameError> {

    if (usingTestData) {
        console.warn("Using test manga list data.");

        const url = "res/TODO.json";

        let job = await fetch(url).then(response => response.json());
        return job;

    }

    const query = `
    query ($userName: String) { 
        MediaListCollection(userName: $userName, type: MANGA) {
            hasNextChunk
            user {
                id
            }
            lists {
                name
                status
                entries {
                    mediaId
                    score
                    progress
                    startedAt { year month day } 
                    completedAt { year month day }
                    media {
                        duration
                        episodes
                        format
                        title {
                            romaji english native userPreferred
                        }
                    }
                }
            }
        }
    }
    `; // Could probably munch the whitespace with a regex but no real need to

    const variables = {
        userName: userName
    };


    // Define the config we'll need for our Api request
    const url = 'https://graphql.anilist.co',
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        };


    const response = await fetch(url, options);
    const foo = await response.json();

    if (foo.errors) {
        console.error(foo.errors);
        return new MAL.BadUsernameError();
    }

    const data = foo.data.MediaListCollection;

    if (data.hasNextChunk) {
        console.warn("TODO: next chunk not implemented yet.");
    }


    return data;

}


/*  
*
* --------------------------------
*
*
*/

// ███╗   ███╗ █████╗ ██╗███╗   ██╗
// ████╗ ████║██╔══██╗██║████╗  ██║
// ██╔████╔██║███████║██║██╔██╗ ██║
// ██║╚██╔╝██║██╔══██║██║██║╚██╗██║
// ██║ ╚═╝ ██║██║  ██║██║██║ ╚████║
// ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝


//
// main chain
//

// main I
// Entry point from html form
function listFormSubmit(e: Event): void {
    // validate?
    const width = $("#width") as JQuery<HTMLInputElement>;


    // 
    beforeAjax().then();
    return;
}

// main II
// Form api requests and call
async function beforeAjax() {
    const username = ($("#listName").val() as string).trim();
    const listKind = $("#list-kind").val() as string;




    if (username === "") {
        reportNoUser();
        return;
    }

    switch (listKind) {
        case "ANIME":
            {     // check cache for name
                // to skip ajax
                const data: MAL.AnimeList | MAL.BadUsernameError = userAnimeCache.get(username);
                if (data) {
                    console.info([username, "'s data loaded from cache."].join(""));
                    if (data instanceof MAL.BadUsernameError) {
                        reportBadUser(username);
                    } else {
                        prepareTimeline(data);
                    }
                    return;
                }


                const aniList = await getAniList(username);
                debugData["aniList"] = aniList;

                if (aniList instanceof MAL.BadUsernameError) {
                    reportBadUser(username);
                    userAnimeCache.set(username, aniList);
                    return;
                }

                const animeList = MAL.animeListFromAniList(aniList, username);
                debugData["list"] = animeList;

                userAnimeCache.set(username, animeList);
                // drawHoursWatched(animeList);
                prepareTimeline(animeList);
            }
            break;
        case "MANGA":
            {
                const data: MAL.MangaList | MAL.BadUsernameError = userMangaCache.get(username);
                if (data) {
                    console.info([username, "'s data loaded from cache."].join(""));
                    if (data instanceof MAL.BadUsernameError) {
                        reportBadUser(username);
                    } else {
                        prepareTimeline(data);
                    }
                    return;
                }


                const aniList = await getMangaList(username);
                debugData["aniList"] = aniList;

                if (aniList instanceof MAL.BadUsernameError) {
                    reportBadUser(username);
                    userMangaCache.set(username, aniList);
                    return;
                }

                const mangaList = MAL.mangaListFromAniList(aniList, username);
                debugData["list"] = mangaList;

                userMangaCache.set(username, mangaList);
                prepareTimeline(mangaList);
            }
            break;
        default:
            console.error("Unexpected list-kind:", listKind);
    }




}




// main V
// Use doc to build timeline
function prepareTimeline(mal: MAL.AnimeList | MAL.MangaList): void {

    const listKind = $("#list-kind").val() as string;

    let startDate: string = ($("#from").val() as string).trim();
    let endDate: string = ($("#to").val() as string).trim();


    startDate = fixDate(startDate, -1);
    endDate = fixDate(endDate, 1);


    const widthStr: string = ($("#width").val() as string).trim();

    const language = $("#language").val() as string;

    const username = ($("#listName").val() as string).trim();


    let width: number;
    if (isNormalInteger(widthStr)) {
        width = parseInt(widthStr);
    } else {//default
        width = 1000;
    }

    const showSeasons = ($("#seasons")[0] as HTMLInputElement).checked;

    const fontSize = ($("#font-size")).val() as number;





    const tlConfig: AnimeListTimelineConfig = {
        userName: username,
        width: width,
        minDate: startDate,
        maxDate: endDate,
        lang: language,
        seasons: showSeasons,
        fontSize: fontSize,
        listKind: listKind,
    };

    const getVal = function (id: string): boolean {
        const el = $(`#format-${id}`)[0] as HTMLInputElement;
        return el.checked;
    }

    switch (listKind) {
        case "ANIME":
            const aFormats: ATL.AnimeFormatSelection = {
                tv: getVal("tv"),
                short: getVal("short"),
                movie: getVal("movie"),
                special: getVal("special"),
                ova: getVal("ova"),
                ona: getVal("ona"),
                music: getVal("music"),
            };
            tlConfig.animeFormat = aFormats;
            break;
        case "MANGA":
            const mFormats: ATL.MangaFormatSelection = {
                manga: getVal("manga"),
                novel: getVal("novel"),
                oneShot: getVal("one-shot")
            };
            tlConfig.mangaFormat = mFormats;
            break;
    }


    updateUri(tlConfig);

    try {
        //global
        const tln = new AnimeListTimeline(mal, tlConfig); // can throw NoDatedAnimeError
        displayTimeline(tlConfig, tln);
        return;

    } catch (err) {
        if (err instanceof NoDatedAnimeError) {
            reportNoDated();
            return;
        } else {
            throw err;
        }
    }

}

// main VI
// write the timeline to the document
// pre: tln is a valid AnimeListTimeline object
function displayTimeline(tlConfig: AnimeListTimelineConfig, tln: AnimeListTimeline): void {

    /*
     This comment could lie
     and so could any other

     `` div #tls
     ``** div
     ``**`` ul buttonlist
     ``**``** li
     ``**``**`` button
     ``**`` div .tl_[n]
     ``**```` svg

     ** → multiple
     `` → single

     */


    //Always add new timeline on top
    const tlArea = document.createElement("div");
    $("#tls").prepend(tlArea);

    // Label
    const label = document.createElement("h3");
    // I don't think this is an xss risk? 
    label.textContent = `${tlConfig.userName}'s ${tlConfig.listKind.toLowerCase()} list`;

    //make buttons
    const removeButton = document.createElement("button");
    removeButton.textContent = "X";
    removeButton.setAttribute("title", "Remove timeline from the page");
    removeButton.addEventListener("click", removeTl);

    const svgButton: MyButton = document.createElement("button");
    svgButton.textContent = "S";
    svgButton.setAttribute("title", "Save as svg");
    svgButton.addEventListener("click", exportTimeline);
    svgButton.kind = exportType.Svg;

    const pngButton: MyButton = document.createElement("button");
    pngButton.textContent = "P";
    pngButton.setAttribute("title", "Save as png");
    pngButton.addEventListener("click", exportTimeline);
    pngButton.kind = exportType.Png;

    const jsonButton: MyButton = document.createElement("button");
    jsonButton.textContent = "J";
    jsonButton.setAttribute("title", "Save tln json");
    jsonButton.addEventListener("click", exportTimeline);
    jsonButton.kind = exportType.Json;

    //make list
    const controls = document.createElement("ul");
    controls.className = "buttonList";
    controls.appendChild(wrapListItem(removeButton));
    controls.appendChild(wrapListItem(svgButton));
    controls.appendChild(wrapListItem(pngButton));
    if (debug) {
        controls.appendChild(wrapListItem(jsonButton));
    }


    // stats
    const statsDetails = document.createElement("details");

    const statsSummary = document.createElement("summary");
    statsDetails.appendChild(statsSummary);
    statsSummary.textContent = "Stats";

    const statsDiv = document.createElement("div");
    statsDetails.appendChild(statsDiv);

    const statsList = document.createElement("ul");
    statsDiv.appendChild(statsList);

    let statsLi = document.createElement("li");
    statsList.appendChild(statsLi);
    statsLi.textContent = `${tln.mediaSet.length} ${tlConfig.listKind.toLowerCase()}`;

    if (ATL.isAnimeList(tln.boundedSet, tlConfig.listKind)) {
        let boundedMinutes = 0;
        for (let media of tln.boundedSet) {
            if (media.seriesEpisodes && media.seriesEpisodesDuration) {
                const mediaMin = media.seriesEpisodes * media.seriesEpisodesDuration;
                boundedMinutes += mediaMin;
            }
        }
        statsLi = document.createElement("li");
        statsList.appendChild(statsLi);
        statsLi.textContent = `${minutesToString(boundedMinutes)} watched`
    }


    //

    //make timeline container
    const tl: MyContainer = document.createElement("div");
    tl.className = "timeline";
    tl.id = "tl_" + timelineCount;
    timelineCount++;

    tl.meta = tln;

    // add to dom
    tlArea.appendChild(label);
    tlArea.appendChild(controls);
    tlArea.appendChild(tl);
    tlArea.appendChild(statsDetails);

    //make timeline after it has a valid anchor in the doc
    const svg: Timeline = new Timeline(tln.data, tl.id);
    svg.build();

    const removeAll = <HTMLButtonElement>document.getElementById("clearAllTimelines");
    removeAll.disabled = false;
}

// ***
// End main chain
// ***

function drawHoursWatched(mal: MAL.AnimeList): void {
    const anime: MAL.Anime[] = [];
    const dateSet: Set<string> = new Set();
    // const dateSet: Set<number> = new Set();
    // Look for all the anime that are completed and have both start and finish dates
    for (let entry of mal.anime) {
        if (entry.myStatus != MAL.Status.Completed) {
            continue;
        }
        if (entry.myStartDate.isNullDate() || entry.myFinishDate.isNullDate()) {
            continue;
        }
        anime.push(entry);
        dateSet.add(entry.myStartDate.fixedDateStr);
        dateSet.add(entry.myFinishDate.fixedDateStr);
    }

    const dates = Array.from(dateSet);
    dates.sort(); // Probably fine on date strings
    // const watchTime:number[] = [];
    const watchTime: Map<string, number> = new Map();
    for (let d of dates) {
        // watchTime.push(0);
        watchTime.set(d, 0);
    }

    for (let entry of anime) {
        const duration = entry.seriesEpisodes * entry.seriesEpisodesDuration;
        watchTime.set(entry.myStartDate.fixedDateStr, watchTime.get(entry.myStartDate.fixedDateStr) + duration);
    }

    watchTime.delete(dates[0]);

    const maxDay = [...watchTime.entries()]
        .reduce((a, e) => e[1] > a[1] ? e : a);

    console.log(maxDay);

}

// ███████╗███████╗███████╗██████╗ ██████╗  █████╗  ██████╗██╗  ██╗
// ██╔════╝██╔════╝██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██║ ██╔╝
// █████╗  █████╗  █████╗  ██║  ██║██████╔╝███████║██║     █████╔╝ 
// ██╔══╝  ██╔══╝  ██╔══╝  ██║  ██║██╔══██╗██╔══██║██║     ██╔═██╗ 
// ██║     ███████╗███████╗██████╔╝██████╔╝██║  ██║╚██████╗██║  ██╗
// ╚═╝     ╚══════╝╚══════╝╚═════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝


//
// feedback
//


function reportNoUser() {
    usernameFeedback("No username given.");
}

function reportBadUser(username: string): void {
    usernameFeedback(username + " is not a valid AniList username.");
}

function reportNoDated() {
    const str = ["None of the anime in the list contained watched dates. ",
        "Try removing date filters. ",
    ]
        .join("");
    giveFeedback(str, 14);
}

function usernameFeedback(str: string) {
    giveFeedback(str);
    $("#listName").select();
}

function giveFeedback(str: string, sec = 5) {

    const time = sec * 1000;

    const feedback = $("#feedback");
    feedback.text(str);
    // feedback[0].textContent = str;
    setTimeout(function () {
        feedback.text("");
    }, time);

}


//
// types
//

enum exportType {
    Png,
    Svg,
    Json
}

class MyButton extends HTMLButtonElement {
    kind?: exportType;
}

class MyContainer extends HTMLDivElement {
    meta?: AnimeListTimeline;
}


// ██████╗ ██╗   ██╗████████╗████████╗ ██████╗ ███╗   ██╗███████╗
// ██╔══██╗██║   ██║╚══██╔══╝╚══██╔══╝██╔═══██╗████╗  ██║██╔════╝
// ██████╔╝██║   ██║   ██║      ██║   ██║   ██║██╔██╗ ██║███████╗
// ██╔══██╗██║   ██║   ██║      ██║   ██║   ██║██║╚██╗██║╚════██║
// ██████╔╝╚██████╔╝   ██║      ██║   ╚██████╔╝██║ ╚████║███████║
// ╚═════╝  ╚═════╝    ╚═╝      ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚══════╝


//
// Buttons (other than submit)
//


// "Remove all" button
function clearAllTimelines(): void {
    this.disabled = true;
    $("#tls").empty();
}

//button listeners. `this` is the button

// "X" button
function removeTl() {
    //rm ../../.. → div {ul, div#tl_}
    this.parentElement.parentElement.parentElement.remove();
    // to do? disable remove all if there are no more timelines
}

// "P" | "S" button
function exportTimeline() {
    //div = ../../.. → div {ul, div#tl_}
    //svg = div/div#tl_/svg
    const div = this.parentElement.parentElement.parentElement;
    const container: MyContainer = div.getElementsByClassName("timeline")[0];
    const svg = container.firstElementChild;

    const fileName: string = container.meta.getDescriptor();

    const svgdata = new XMLSerializer().serializeToString(svg);

    switch (this.kind) {
        //
        case exportType.Png: {
            const img = document.createElement("img");
            img.setAttribute("src", "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgdata))));

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const svgSize = svg.getBoundingClientRect();
            canvas.width = svgSize.width * 3;
            canvas.height = svgSize.height * 3;

            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            img.onload = function () {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(function (blob) {
                    saveAs(blob, fileName + ".png");
                });
            };

        }
            break;
        //
        case exportType.Svg: {

            const blob = new Blob([svgdata], { type: "image/svg+xml" });
            saveAs(blob, fileName + ".svg");
        }
            break;

        case exportType.Json: {

            const blob = new Blob([container.meta.getJson()], { type: "application/json" });
            saveAs(blob, fileName + ".json");
        }
            break;

        //
        default: {
            console.error("unhandled export case");
        }
    }

}


// ██╗   ██╗████████╗██╗██╗     ██╗████████╗██╗   ██╗
// ██║   ██║╚══██╔══╝██║██║     ██║╚══██╔══╝╚██╗ ██╔╝
// ██║   ██║   ██║   ██║██║     ██║   ██║    ╚████╔╝ 
// ██║   ██║   ██║   ██║██║     ██║   ██║     ╚██╔╝  
// ╚██████╔╝   ██║   ██║███████╗██║   ██║      ██║   
//  ╚═════╝    ╚═╝   ╚═╝╚══════╝╚═╝   ╚═╝      ╚═╝   


//
// Util
//

export function wrapListItem(elm: Element) {
    const li = document.createElement("li");
    li.appendChild(elm);
    return li;
}

export function minutesToString(min: number): string {
    let h = Math.floor(min / 60);
    const d = Math.floor(h / 24);
    h = h % 24;

    const m = min % 60;

    if (h > 0) {
        if (d > 0)
            return `${d}D ${h}H ${m}M`;
        else
            return `${h}H ${m}M`;
    }
    return `${m} minutes`;

}

//
// Data cleaning
//

/**
 * Returns if the string represents a non negative integer.
 * @param str
 * @returns {boolean}
 */
export function isNormalInteger(str: string): boolean {
    const n: number = ~~Number(str);
    return (String(n) === str) && (n >= 0);
}

//make user input suitable for anime timeline
//must not be null
export function fixDate(date: string, minmax: -1 | 1): string {

    const minYear = 1980;//Nerds can change this in the future
    const maxYear = 2030;//For now its sane

    const test: boolean = dateRegex.test(date);
    if (!test) {
        date = MAL.rawNullDate;
    }
    let ys: string;
    let ms: string;
    let ds: string;
    if (/^\d\d\d\d\d\d\d\d$/.test(date)) {
        ys = date.slice(0, 4);
        ms = date.slice(4, 6);
        ds = date.slice(6, 8);
    } else {
        ys = date.slice(0, 4);
        ms = date.slice(5, 7);
        ds = date.slice(8, 10);
    }
    const y: number = parseInt(ys);
    const m: number = parseInt(ms);
    const d: number = parseInt(ds);

    //A date needs at least a sane year
    if (y < minYear || y > maxYear) {
        if (minmax == -1)
            ys = minYear.toString();
        else // (minmax == 1)
            ys = maxYear.toString();

    }
    if (m < 0 || m > 12) {
        ms = "00";
    }
    if (d < 0 || d > 32) {
        ds = "00";
    }

    return [ys, ms, ds].join("-")
}


//
// url query manipulation
//

//http://stackoverflow.com/a/8486188/1993919
export function getJsonFromUrl(hashBased?): any {
    let query;
    if (hashBased) {
        let pos = location.href.indexOf("?");
        if (pos == -1) return [];
        query = location.href.substr(pos + 1);
    } else {
        query = location.search.substr(1);
    }
    const result = {};
    query.split("&").forEach(function (part) {
        if (!part) return;
        part = part.split("+").join(" "); // replace every + with space, regexp-free version
        const eq = part.indexOf("=");
        let key = eq > -1 ? part.substr(0, eq) : part;
        const val = eq > -1 ? decodeURIComponent(part.substr(eq + 1)) : "";
        const from = key.indexOf("[");
        if (from == -1) result[decodeURIComponent(key)] = val;
        else {
            const to = key.indexOf("]");
            const index = decodeURIComponent(key.substring(from + 1, to));
            key = decodeURIComponent(key.substring(0, from));
            if (!result[key]) result[key] = [];
            if (!index) result[key].push(val);
            else result[key][index] = val;
        }
    });
    return result;
}

//http://stackoverflow.com/a/19472410/1993919
export function replaceQueryParam(param: string, newval: string, search: string): string {
    // Could default but probably not intended.
    //search = search || window.location.search;

    const regex = new RegExp("([?;&])" + param + "[^&;]*[;&]?");
    const query = search.replace(regex, "$1").replace(/&$/, '');

    return (query.length > 2 ? query + "&" : "?") + (newval ? param + "=" + newval : '');
}

export function updateUri(param: AnimeListTimelineConfig): void {

    // Why were these read from dom instead of `param`?
    // Was it because param squeezes the dates? (Does it?)
    let startDate: string = ($("#from").val() as string).trim();
    if (startDate === "") {
        startDate = "";
    }
    let endDate: string = ($("#to").val() as string).trim();
    if (endDate === "") {
        endDate = "";
    }

    const kind = $("#list-kind").val() as string;

    const keys = AnimeListTimelineConfigKeys;

    let str = window.location.search;


    str = replaceQueryParam(keys.userName, param.userName, str);
    str = replaceQueryParam(keys.width, param.width.toString(), str);
    str = replaceQueryParam(keys.minDate, startDate, str);
    str = replaceQueryParam(keys.maxDate, endDate, str);
    str = replaceQueryParam(keys.lang, param.lang, str);
    str = replaceQueryParam(keys.seasons, param.seasons.toString(), str);
    str = replaceQueryParam(keys.listKind, kind, str);
    str = replaceQueryParam(keys.fontSize, param.fontSize.toString(), str);

    window.history.replaceState(null, null, str);
}

//
// API urls
//




//
// test(ing) stuff
//

