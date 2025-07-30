
const axios = require("axios");
const { load } = require("cheerio");
const baseUrl = "https://cinesubz.lk";

// 📦 Download link, size, quality extract function
function extractLinks(dl2) {
    const regexLink = /dlLink:\s*\["(.*?)"]/g;
    const regexSize = /size:\s*"(.*?)"/g;
    const regexQuality = /resolution:\s*"(.*?)"/g;

    const links = [...dl2.matchAll(regexLink)].map(match => match[1]);
    const sizes = [...dl2.matchAll(regexSize)].map(match => match[1]);
    const qualities = [...dl2.matchAll(regexQuality)].map(match => match[1]);

    return links.map((link, index) => ({
        link: link.split('"')[0],
        size: sizes[index]?.split('"')[0] || "",
        quality: qualities[index]?.split('"')[0] || "",
    }));
}

// 🛠️ Fixed HTML fetcher using axios
async function fetchHtml(url) {
    try {
        const response = await axios.get(url); // ✅ fetch -> axios.get
        return response.data; // ✅ .text() -> .data (axios returns .data)
    } catch (e) {
        console.error('Error fetching HTML:', e.message);
        throw new Error('Error fetching HTML');
    }
}

async function getCineDownloadUrls($) {

        const downloadUrls = [];
        $('tr.clidckable-rowdd').each((index, element) => {
              const quality = $(element).find('td:nth-child(1)').text();
              const size = $(element).find('td:nth-child(2)').text();
              const language = $(element).find('td:nth-child(3)').text();
              const link = $(element).attr('data-href').replace("cinesubz.net", "cinesubz.lk");
              const buttonText = $(element).find('td:nth-child(1) a strong').text();
              downloadUrls.push({ quality, size, language, link });
        });

        if (downloadUrls.length === 0) {
    const script = $("#info > div > div:nth-child(2) > script").text().trim();
    const extraData = extractLinks(script);
    for (const data of extraData) {
        downloadUrls.push({
            quality: data.quality,
            size: data.size,
            language: "",
            link: data.link
        });
    }
}


        return downloadUrls

}

function isValidUrl(url) {
    const httpsRegex = /^https:\/\/[^\s/$.?#].[^\s]*$/;
    return httpsRegex.test(url);
}

async function ApiReq(data, url) {
    try {
            const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data)
                });
                return res.json()

    } catch (error) {
        console.error('Error making the request:', error);
    }
}


async function replaceUrl(query) {
    try {
        if (!query) throw new Error("Query is empty!");

        const html = await fetchHtml(query);
        const $ = load(html);
        let link = $('#link').attr('href');
        query = link

        const url1 = ["https://google.com/server11/1:/", "https://google.com/server12/1:/", "https://google.com/server13/1:/"];
        const url2 = ["https://google.com/server21/1:/", "https://google.com/server22/1:/", "https://google.com/server23/1:/"];
        const url3 = ["https://google.com/server3/1:/"];
        const url4 = ["https://google.com/server4/1:/"];
        const url5 = ["https://google.com/server5/1:/"];

        if (url1.some(u => query.includes(u))) {
            link = query.replace(url1.find(u => query.includes(u)), 'https://drive2.cscloud12.online/server1/');
        } else if (url2.some(u => query.includes(u))) {
            link = query.replace(url2.find(u => query.includes(u)), 'https://drive2.cscloud12.online/server2/');
        } else if (url3.some(u => query.includes(u))) {
            link = query.replace(url3.find(u => query.includes(u)), 'https://drive2.cscloud12.online/server3/');
        } else if (url4.some(u => query.includes(u))) {
            link = query.replace(url4.find(u => query.includes(u)), 'https://drive2.cscloud12.online/server4/');
        } else if (url5.some(u => query.includes(u))) {
            link = query.replace(url5.find(u => query.includes(u)), 'https://drive2.cscloud12.online/server5/');
        }

        if (link.includes(".mp4?bot=cscloud2bot&code=")) link = link.replace(".mp4?bot=cscloud2bot&code=", "?ext=mp4&bot=cscloud2bot&code=");
        if (link.includes(".mp4")) link = link.replace(".mp4", "?ext=mp4");
        if (link.includes(".mkv?bot=cscloud2bot&code=")) link = link.replace(".mkv?bot=cscloud2bot&code=", "?ext=mkv&bot=cscloud2bot&code=");
        if (link.includes(".mkv")) link = link.replace(".mkv", "?ext=mkv");
        if (link.includes(".zip")) link = link.replace(".zip", "?ext=zip");

        return link;
    } catch (error) {
        console.error({ status: false, error: error.message });
        return query;
    }
}


//====================================================================

module.exports = class Cinesubz {
    constructor() {}

async search(query) {
    try {

        if (!query) throw new Error("Query cannot be empty!");

        const html = await fetchHtml(baseUrl + "?s=" + encodeURIComponent(query));
        const $ = load(html);

        let movies = [];
        $("#contenedor > div.module > div.content.rigth.csearch > div > div > article").each((i, el) => {
            const imdb = $(el).find("div.details > div.meta > span.rating:nth-child(1)").text().toUpperCase().replace("IMDB ", "");
            const year = $(el).find("div.details > div.meta > span.year").text();
            const title = $(el).find("div.details > div.title > a").text();
            const link = $(el).find("div.details > div.title > a").attr("href").replace("https://cinesubz.net/", baseUrl);
            const image = $(el).find("div.image > div > a > img").attr("src");
            const type = $(el).find("div.image > div > a > span").text().trim();
            const description = $(el).find("div.details > div.contenido > p").text().trim();
            movies.push({ title, imdb, year, link, image, type, description });
        });

        if (movies.length === 0) {
            const apiResponse = await fetch(`${baseUrl}wp-json/dooplay/search/?keyword=${encodeURIComponent(query)}&nonce=03dfb5c5ca`);
            const jsonData = await apiResponse.json();

            const jsonArray = Object.values(jsonData);
            let type = "TV";

            jsonArray.forEach(el => {
                const title = el.title;
                const imdb = el.extra.imdb;
                const year = el.extra.date;
                const link = el.url;
                const image = el.img;
                if (link.includes("movies")) type = "Movie";
                const description = "";
                movies.push({ title, imdb, year, link, image, type, description });
            });
        }

        const mvList = movies.filter(i => i.type === "Movie");
        const tvList = movies.filter(i => i.type === "TV");

        return { all: movies, movies: mvList, tvshows: tvList };
    } catch (error) {
        console.error({
            status: false,
            error: error.message,
        });
        return null; // Return null if error occurs
    }
}

//================================================
async movieData(url){

    try{

        const html = await fetchHtml(url);
        const $ = load(html);

        const title = $("div.data > h1").text().trim();
        const maintitle = title.replace(/(Sinhala Subtitles?\s*\|\s*සිංහල උපසිරැසි සමඟ|Sinhala Subtitles?|with Sinhala Subtitles?|සිංහල උපසිරැසි\s*සමඟ|\|\s*සිංහල උපසිරැසි(?:\s*සමඟ)?)/gi, '').trim();
        const dateCreate = $(".extra span:nth-child(1)").text().trim();
        const country = $(".country").text().trim();
        const runtime = $(".runtime").text().trim();
        const mainImage = $(".poster img").attr("src").replace("fit=", "fit").replace(/-\d+x\d+\.jpg$/, '.jpg').replace("https://cinesubz.net/", baseUrl);
        const titleLong = $(".tagline1").text().trim();
        const categorydata = $(".sgeneros a").text().trim();
        const category = categorydata.match(/([A-Z][a-z]+|\d+\+?)/g);
        const directorName = $("#cast div:nth-child(3) div div.data div.name a").text().trim();
        const directorUrl = $("#cast div:nth-child(3) div div.data div.name a").attr("href");
        const ratingValue = $('.sheader .starstruck-rating .dt_rating_vgs').text().trim() || "00";
        const ratingCount = $('.sheader .starstruck-rating .rating-count').text().trim() || "00";
        const imdbrating = $(".rating-number").text().trim() || "00";
        const imdbratingCount = $(".votes-count").text().trim().replace("votes", "").trim() || "00";
        const description = $('#info div[itemprop="description"]').clone().find('script').remove().end().text().trim();

        const cast = [];
        $("#cast > div:nth-child(5) > div").each((i, el) => {
            const actorName = $(el).find("div.name a").text().trim();
            const actorUrl = $(el).find("div.name a").attr("href");
            const castName = $(el).find(".caracter").text().trim();
            cast.push({
                actor:{
                    name: actorName,
                    link: actorUrl
                },
                character: castName
            })
        })

        const imageUrls = [];
        $('meta[property="og:image"]').each((i, el) => {
            const content = $(el).attr('content');
             if (content) {
               imageUrls.push(content.trim());
            }
        });

        const downloadUrl = await getCineDownloadUrls($);

        return {
            maintitle,
            title,
            titleLong,
            dateCreate,
            country,
            runtime,
            category,
            mainImage,
            imageUrls,
            description,
            rating: {
                value: ratingValue,
                count: ratingCount
            },
            imdb: {
                value: imdbrating,
                count: imdbratingCount
            },
            director: {
                name: directorName,
                link: directorUrl
            },
            cast,
            downloadUrl
        }


    } catch (error) {
        console.error({
            status: false,
            error: error.message,
        });
        return null; // Return null if error occurs
    }
}

//================================================
async tvshowData(url){

    try{

        const html = await fetchHtml(url);
        const $ = load(html);

        const title = $("div.data > h1").text().trim();
        const maintitle = title.replace(/(Sinhala Subtitles?\s*\|\s*සිංහල උපසිරැසි සමඟ|Sinhala Subtitles?|with Sinhala Subtitles?|සිංහල උපසිරැසි\s*සමඟ|\|\s*සිංහල උපසිරැසි(?:\s*සමඟ)?)/gi, '').trim();
        const dateCreate = $(".extra span:nth-child(1)").text().trim();
        const dateEnd = $("#info div:nth-child(6) span").text().trim();
        const country = $("#dtcreator1 span a").text().trim();
        const language = $("#dtstudio1 span a").text().trim();
        const mainImage = $(".poster img").attr("src").replace("fit=", "fit").replace(/-\d+x\d+\.jpg$/, '.jpg').replace("https://cinesubz.net/", baseUrl);
        const categorydata = $(".sgeneros a").text().trim();
        const category = categorydata.match(/([A-Z][a-z]+|\d+\+?)/g);
        const directorName = $("#cast div:nth-child(2) div div.data div.name a").text().trim();
        const directorUrl = $("#cast div:nth-child(2) div div.data div.name a").attr("href");
        const ratingValue = $('.sheader .starstruck-rating .dt_rating_vgs').text().trim() || "00";
        const ratingCount = $('.sheader .starstruck-rating .rating-count').text().trim() || "00";
        const imdbrating = $("#repimdb strong:nth-child(1)").text().trim() || "00";
        const imdbratingCount = $("#repimdb").text().replace(imdbrating, "").trim().replace("votes", "").trim() || "00";
        const description = $("#info > div.wp-content > p").clone().find('script').remove().end().text().trim();


        const cast = [];
        $("#cast div:nth-child(4) div.person").each((i, el) => {
            const actorName = $(el).find("div.name a").text().trim();
            const actorUrl = $(el).find("div.name a").attr("href");
            const castName = $(el).find(".caracter").text().trim();
            if(actorName && actorUrl && castName){
            cast.push({
                actor:{
                    name: actorName,
                    link: actorUrl
                },
                character: castName
            })
        }
    })

        const imageUrls = [];
        $('meta[property="og:image"]').each((i, el) => {
            const content = $(el).attr('content');
             if (content) {
               imageUrls.push(content.trim());
            }
        });

        const episodesDetails = [];
        $('#seasons .se-q').each((index, element) => {
            const seasonNumber = $(element).find('.se-t').text().trim();
            const seasonDate = $(element).find('.title i').text().trim();
            const seasonTitle = $(element).find('.title').text().trim().replace(`${seasonDate}`, '').trim();

            const seasonEpisodes = [];
            $(element).next('.se-a').find('.episodios li').each((idx, elem) => {
                let episodeNumber = $(elem).find('.numerando').text().trim();
                const episodeTitle = $(elem).find('.episodiotitle').text().trim();
                const episodeURL = $(elem).find('.episode-link').attr('href');
                const episodeDate = $(elem).find('.episodiotitle .date').text().trim();

               episodeNumber.replace(/S(\d+)\s*E(\d+)/i, (match, s, e) => {
                  episodeNumber = `${parseInt(s)} - ${parseInt(e)}`;
                });

                seasonEpisodes.push({
                    number: episodeNumber,
                    title: episodeTitle,
                    url: episodeURL,
                    date: episodeDate
                });
            });

            episodesDetails.push({
                season: {
                    number: seasonNumber,
                    title: seasonTitle,
                    date: seasonDate
                },
                episodes: seasonEpisodes
            });
        });


        return {
            maintitle,
            title,
            country,
            language,
            dateCreate,
            dateEnd,
            category,
            mainImage,
            imageUrls,
            description,
            rating: {
                value: ratingValue,
                count: ratingCount
            },
            imdb: {
                value: imdbrating,
                count: imdbratingCount
            },
            director: {
                name: directorName,
                link: directorUrl
            },
            cast,
            episodesDetails
        }


    } catch (error) {
        console.error({
            status: false,
            error: error.message,
        });
        return null; // Return null if error occurs
    }
}

//================================================
async episodeData(url){

    try{

        const html = await fetchHtml(url);
        const $ = load(html);

        const maintitle = $('#info .epih1').text().trim().replace(/\s*\[.*?\]\s*/, '').replace('Sinhala Subtitles | සිංහල උපසිරැසි සමඟ', '').trim();
        const title = $('#info .epih1').text().trim().replace(/\s*\[.*?\]\s*/, '').trim();
        const dateCreate = $("#info span").text().trim();
        const episodeTitle = $('#info .epih3').text().trim();

        const imageUrls = [];
        $('meta[property="og:image"]').each((i, el) => {
            const content = $(el).attr('content');
             if (content) {
               imageUrls.push(content.trim());
            }
        });

        const downloadUrl = await getCineDownloadUrls($);

        return {
            maintitle,
            title,
            episodeTitle,
            dateCreate,
            imageUrls,
            downloadUrl
        }


    } catch (error) {
        console.error({
            status: false,
            error: error.message,
        });
        return null; // Return null if error occurs
    }
}

//================================================
async download(query) {
    try {
        const link = query.includes(`${baseUrl}api`) ? await replaceUrl(query) : query;
        const $ = load(await fetchHtml(link));
        const title = $("#box > div.download-section > p:nth-child(2) > span").text().trim();

        const requests = {
            gdrive: ApiReq({ gdrive: true }, link),
            gdrive2: ApiReq({ gdrive: true, second: true }, link),
            direct: ApiReq({ direct: true }, link),
            mega: ApiReq({ mega: true }, link),
            pixel: ApiReq({ pix: true, nc: true }, link),
            pixel2: ApiReq({ pix: true }, link),
        };

        const responses = await Promise.allSettled(
            Object.entries(requests).map(([key, promise]) =>
                promise.then(data => ({ key, data }))
            )
        );

        const result = {
            title: title,
            mimetype: null,
            download: {
                gdrive: null,
                gdrive2: null,
                direct: null,
                mega: null,
                pixel: null,
                pixel2: null
            }
        };

        responses.forEach(({ status, value }) => {
            if (status === "fulfilled" && value?.data) {
                const url = value.data?.url || value.data?.mega || null;
                result.download[value.key] = url;
                if (value.key === "gdrive" && value.data?.mime) {
                    result.mimetype = value.data.mime;
                }
            }
        });

        return result;

    } catch (error) {
        return {
            title: null, 
            mimetype: null,
            download: {
                gdrive: null,
                gdrive2: null,
                direct: null,
                mega: null,
                pixel: null,
                pixel2: null,
            }
        };
    }
  }
}
