const files = [
  ["01", "Fancafe", "Fancafe posts and letters", "https://tbzarchive1206.github.io/fancafe"],
  ["02", "Livestreams", "Live broadcasts", "https://tbzarchive1206.github.io/livestream-archive/"],
  ["03", "Naver Post", "Naver Post", "https://tbzarchive1206.github.io/naverpost"],
  ["04", "TikToks", "Tiktoks", "https://tbzarchive1206.github.io/tiktok-youtube/"],
  ["05", "Twitter Media", "Twitter Media", "https://tbzarchive.com/twitter-media/"],
  ["06", "Scans", "Photobooks, magazines", "https://tbzarchive1206.github.io/scans/"],
  ["07", "The B Japan", "Japanese fanclub", "https://tbzarchive1206.github.io/thebjapan/"],
  ["08", "Bubble Media", "Bubble Media", "https://tbzarchive1206.github.io/bubble-archive/"],
  ["09", "Fromm Media", "Fromm Media", "https://tbzarchive1206.github.io/fromm-media/"],
  ["10", "Personal Instagrams", "Individual THE BOYZ Instagram accounts", "https://tbzarchive1206.github.io/insta-post-archive/"],
  ["11", "Instagram Stories", "Individual THE BOYZ Instagram Stories", "https://tbzarchive1206.github.io/insta-stories-archive/"],
  ["12", "Concerts & Fancons", "Concerts Archive", "https://tbzarchive1206.github.io/concerts/"],
  ["13", "Radio", "Radio, DJ", "https://tbzarchive1206.github.io/radio-archive/"],
  ["14", "Festival Performances", "Festivals, performances", "https://tbzarchive1206.github.io/festivals-performances"],
  ["15", "Variety Programs", "Youtube and TV show appearances", "https://tbzarchive1206.github.io/variety-programs"],
  ["16", "Weibo Media", "Weibo Media", "https://tbzarchive1206.github.io/weibo/"],
  ["17", "Xiaohongshu Media", "Xiaohongshu Media", "https://tbzarchive1206.github.io/xiaohongshu/"],
  ["18", "Insta Channels", "Instagram Channel Archive", "https://tbzarchive1206.github.io/insta-channels/"],
  ["19", "Events", "Events media archive", "https://tbzarchive1206.github.io/events/"],
  ["20", "TBZ x Brands", "Brand collaborations", "https://tbzarchive1206.github.io/tbz-brands/"],
  ["21", "Solo Activities Media", "Solo activities archive", "https://tbzarchive1206.github.io/solo-activities/"],
  ["22", "Music", "Music archive", "https://tbzarchive1206.github.io/music-archive/"]
];

const grid = document.querySelector("#folders");
const empty = document.querySelector("#empty");
const search = document.querySelector("#search");

function createFolder([number, title, description, href]) {
  const folder = document.createElement(href ? "a" : "div");
  folder.className = `folder${href ? "" : " pending"}`;

  if (href) {
    folder.href = href;
    folder.setAttribute("aria-label", `Open ${title}`);
  } else {
    folder.setAttribute("aria-disabled", "true");
  }

  const tab = document.createElement("span");
  tab.className = "folder-tab";
  tab.textContent = `FILE ${number}`;

  const arrow = document.createElement("span");
  arrow.className = "folder-arrow";
  arrow.textContent = href ? "→" : "—";

  const body = document.createElement("div");
  body.className = "folder-body";
  const heading = document.createElement("h3");
  heading.textContent = title;
  const label = document.createElement("small");
  label.textContent = `THE BOYZ ARCHIVE / ${number}`;
  body.append(heading, label);
  folder.append(tab, arrow, body);

  return folder;
}

function render(query = "") {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matchingFiles = files.filter(([, title, description]) =>
    `${title} ${description}`.toLocaleLowerCase().includes(normalizedQuery)
  );

  grid.replaceChildren(...matchingFiles.map(createFolder));
  empty.hidden = matchingFiles.length > 0;
}

render();
search.addEventListener("input", (event) => render(event.target.value));
