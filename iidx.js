const host = "p.eagate.573.jp";

const pages = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

const playdata = []

const id = 1;

const url = (level, page) => 
    `https://${host}/game/2dx/28/djdata/music/difficulty.html?difficult=${level}&style=0&disp=1${page > 0 ? `&offset=${page*50}`:''}`

const getDocumentObject = buffer => new DOMParser().parseFromString(new TextDecoder("shift-jis").decode(buffer), "text/html");

const getUserId = async () => await fetch(`https://${host}/game/2dx/28/djdata/status.html`)
    .then(html => html.arrayBuffer())
    .then(buffer => getDocumentObject(buffer))
    .then(dom => dom.querySelectorAll(".dj-profile td")[5].innerText.replace("-", ""))

const getData = (el, level) => {
    const data = new Object();
    const attr = el.querySelectorAll("td");
    data.title = attr[0].innerText;
    data.difficulty = attr[1].innerText;
    data.level = level + 1;
    data.rank = attr[2].querySelector("img")
                    .getAttribute("src")
                    .replace("/game/2dx/28/images/score_icon/", "")
                    .replace(".gif", "")
                    .replace("---", "NO PLAY");
    [data.score, data.pgreat, data.great] = attr[3].innerText.split(/[()/]/).map(value => parseInt(value));
    const cleartype = attr[4].querySelector("img")
                    .getAttribute("src")
                    .replace("/game/2dx/28/images/score_icon/", "")
                    .replace("clflg", "")
                    .replace(".gif", "");
    data.cleartype = cleartype === '1' ? 'FAILED' :
    cleartype === '2' ? 'ASSIST CLEAR' :
    cleartype === '3' ? 'EASY CLEAR' :
    cleartype === '4' ? 'CLEAR' :
    cleartype === '5' ? 'HARD CLEAR' :
    cleartype === '6' ? 'EX HARD CLEAR' :
    cleartype === '7' ? 'FULLCOMBO CLEAR' : 'NO PLAY'
    console.log(`${data.title} (${data.difficulty}) ok`);
    return data;
}

const prepareData = async () => {
    let level = 0;
    while (level < 12) {
        while (true) {
            const el = await fetch(url(level, pages[level]))
                .then(html => html.arrayBuffer())
                .then(buffer => getDocumentObject(buffer))
                .then(dom => dom.querySelectorAll(".series-difficulty tr"));
            if (el.length <= 0) break;
            pages[level]++;
        }
        level++;
    }
}

const fetchData = async (level, page) =>
    await fetch(url(level, page))
        .then(html => html.arrayBuffer())
        .then(buffer => getDocumentObject(buffer))
        .then(dom => {
            const tableElements = dom.querySelectorAll(".series-difficulty tr")
            const list = [];
            if (tableElements.length > 0) {
                for (const [index, value] of tableElements.entries()) {
                    if (index > 1) {
                        list.push(getData(value, level));
                    }
                }
            } 
            return list;
        });

const fetchDataLoop = async () => {
    for (let level = 0; level < 12; level++) {
        console.log("---------------------")
        for (let page = 0; page < pages[level]; page++) {
            const data = await fetchData(level, page);
            playdata.push(...data);
        }
    }
}

const postData = async (id) => {
    return await fetch(`http://localhost:4000/api/playdata`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        mode: 'no-cors',
        credentials: 'include',
        body: `playdata=${encodeURIComponent(JSON.stringify(playdata))}&id=${id}`,
        redirect: 'follow'
    });
}
    
const loop = async () => {
    const id = await getUserId();
    await prepareData();
    await fetchDataLoop();
    await postData(id);
}

loop();