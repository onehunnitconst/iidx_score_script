const host = "p.eagate.573.jp";

const levels = [...Array(12).keys()];

const url = (level, page) => 
    `https://${host}/game/2dx/28/djdata/music/difficulty.html?difficult=${level}&style=0&disp=1${page > 0 ? `&offset=${page*50}`:''}`

const getDocumentObject = buffer => new DOMParser().parseFromString(new TextDecoder("shift-jis").decode(buffer), "text/html");

const getData = (el, level) => {
    const data = new Object();
    const attr = el.querySelectorAll("td");
    data.title = attr[0].innerText;
    data.diff = attr[1].innerText;
    data.level = level + 1;
    data.rank = attr[2].querySelector("img")
                    .getAttribute("src")
                    .replace("/game/2dx/28/images/score_icon/", "")
                    .replace(".gif", "");
    [data.score, data.pgreat, data.great] = attr[3].innerText.split(/[()/]/).map(value => parseInt(value));
    return data;
}

levels.forEach(async level => {
    console.log(`start getting level ${level+1} data`);
    let page = 0;
    while (page >= 0) {
        await fetch(url(level, page))
            .then(html => html.arrayBuffer())
            .then(buffer => getDocumentObject(buffer))
            .then(dom => {
                const list = dom.querySelectorAll(".series-difficulty tr")
                if (page >= 0) {
                    list.forEach((value, key) => {
                        if (key > 1) {
                            console.log(getData(value, level));
                            page++;
                        }
                    });
                } 
                else {
                    console.log(`no data at level ${level+1}`);
                    page = -1;
                } 
            });
    }
    console.log(`${level+1} finished`);
});