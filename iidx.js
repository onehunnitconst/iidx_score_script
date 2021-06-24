const host = "p.eagate.573.jp";

const diffs = [...Array(12).keys()]

const url = (diff, page) => {
    return (
        "https://" +
        host + 
        "/game/2dx/28/djdata/music/difficulty.html" +
        "?difficult=" + diff +
        "&style=0&disp=1" +
        (page <= 1 ? "" : "&offset=" + (page-1) * 50)
    );
};

const options = {
    method: "GET",
    headers: {
        'Accept-Language': 'ko,ja',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
};

diffs.forEach(async diff => {
    let page = 1;
    while(page != 0) {
        await fetch(url(diff, page))
            .then(html => html.arrayBuffer())
            .then(buffer => new TextDecoder("shift-jis").decode(buffer))
            .then(text => {
                const dom = new DOMParser().parseFromString(text, 'text/html');
                if (dom.querySelector(".series-difficulty") === undefined) {
                    page = 0;
                } else {
                    const chart = dom.querySelectorAll(".series-difficulty tr");
                    chart.forEach((value, key) => {
                        if (key > 1) {
                            const el = value.querySelectorAll("td");
                            const title = el[0].querySelector("a").innerHTML;
                            console.log("title: " + title);
                            console.log("score: " + el[3].innerHTML.split("<br>"));
                            setTimeout(500);
                        }
                    })
                    page += 1;
                }
            })
            .catch(err => {
                console.log("err: " + err);
                page = 0;
            })
    }
});