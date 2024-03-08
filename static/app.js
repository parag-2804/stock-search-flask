let symbol = "";

function submitNewSymbol(event) {
    event.preventDefault();
    hideMainContentContainerAndClearAllTabs();
    let newsymbol = document.getElementById('symbol').value;
    console.log('symbol:', newsymbol);
    symbol = newsymbol;
    clearErrorContainer();
    defaultCheckRadio();
    openCompanyInfoTab();
    getCompanyInfo();

    getStockSummary();
    getChartsData();
    getLatestNewsData();
}

function clearErrorContainer() {
    document.getElementById('errorContainer').style.display = 'none';
}

function addErrorToContainer(error) {
    document.getElementById('errorContainer').style.display = 'block';
    document.getElementById('errorContainer').innerHTML = `<p>Error: ${error}</p>`;
}

let tabs = ['tab-company-info', 'tab-stock-summary', 'tab-charts', 'tab-news']

let radios = ['radio-company-info', 'radio-stock-summary', 'radio-charts', 'radio-news']

function defaultCheckRadio() {
    document.getElementById('radio-company-info').checked = true;
    document.getElementById('radio-stock-summary').checked = false;
    document.getElementById('radio-charts').checked = false;
    document.getElementById('radio-news').checked = false;
}

function hideMainContentContainerAndClearAllTabs() {
    document.getElementById('main-content-container').style.display = 'none';
    clearErrorContainer();
    tabs.forEach(tab => {
        document.getElementById(tab).innerHTML = '';
        document.getElementById(tab).style.display = 'none';
    });
}

function hideOtherTabsAndChangeActiveTab(tabName) {
    tabs.forEach(tab => {
        if (tab === tabName) {
            document.getElementById(tab).style.display = 'flex';
        } else {
            document.getElementById(tab).style.display = 'none';
        }
    });
}

// Add eventlister for tab-input-radio and call hideOtherTabsAndChangeActiveTab
function openCompanyInfoTab() {
    hideOtherTabsAndChangeActiveTab('tab-company-info');

}

function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

function getCompanyInfo() {
    showLoader();
    fetch('/company-info/' + symbol)
        .then(response => response.json())
        .then(data => {
            if (!data?.name) {
                addErrorToContainer('No record has been found, please enter a valid symbol');
                hideLoader();
                return;
            }
            document.getElementById('main-content-container').style.display = 'flex';
            let companyInfoDiv = document.getElementById('tab-company-info');
            companyInfoDiv.innerHTML = `
                <div class="info-container" style="width: 600px">
                    <img src="${data.logo}" class="company-logo" alt="Company Logo">
                    <table id="companyTable">
                        <tr>
                            <td>Company Name</td>
                            <td id="companyName">${data.name}</td>
                        </tr>
                        <tr>
                            <td>Stock Ticker Symbol</td>
                            <td id="stockTicker">${data.ticker}</td>
                        </tr>
                        <tr>
                            <td>Stock Exchange Code</td>
                            <td id="stockExchange">${data.exchange}</td>
                        </tr>
                        <tr>
                            <td>Company Start Date</td>
                            <td id="companyStartDate">${data.ipo}</td>
                        </tr>
                        <tr>
                            <td>Category</td>
                            <td id="category">${data.finnhubIndustry}</td>
                        </tr>
                    </table>
                </div>
                `;
            hideLoader();
        }).catch(error => {
        // addErrorToContainer('Error fetching company info: ' + error);
    });
}

async function openStockSummaryTab() {
    hideOtherTabsAndChangeActiveTab('tab-stock-summary');
}

async function getStockSummary() {
    let htmlToAdd = "";
    await fetch('/company-stock-summary/' + symbol)
        .then(response => response.json())
        .then(data => {
            if (!data?.c) {
                // addErrorToContainer('No stock summary found for symbol: ' + symbol);
                return;
            }
            // ${data.d > 0 ?
            //                         <img src="/img/GreenArrowUp.png" alt="up arrow" style="width: 20px; height: 20px"/>
            //                         : <img src="/img/RedArrowDown.png" alt="down arrow" style="width: 20px; height: 20px"/>
            //                     }
            const arrowHtml = data.d > 0 ? `<img src="/static/img/GreenArrowUp.png" alt="up arrow" style="width: 13px; height: 13px"/>` : `<img src="/static/img/RedArrowDown.png" alt="down arrow" style="width: 13px; height: 13px"/>`;
            htmlToAdd += `
                <div class="info-container" style="width: 600px">
                    <table id="companyTable">
                        <tr>
                            <td>Stock Ticker Symbol</td>
                            <td id="stockSummaryTicker">${symbol}</td>
                        </tr>
                        <tr>
                            <td>Trading Day</td>
                            <td id="tradingDay">${new Date(data.t * 1000).toLocaleDateString()}</td>
                        </tr>
                        <tr>
                            <td>Previous Closing Price</td>
                            <td id="previousClosingPrice">${data.pc}</td>
                        </tr>
                        <tr>
                            <td>Opening Price</td>
                            <td id="openingPrice">${data.o}</td>
                        </tr>
                        <tr>
                            <td>High Price</td>
                            <td id="highPrice">${data.h}</td>
                        </tr>
                        <tr>
                            <td>Low Price</td>
                            <td id="lowPrice">${data.l}</td>
                        </tr>
                        <tr>
                            <td>Change</td>
                            <td id="change" >
                                ${data.d}
                                ${arrowHtml}
                            </td>
                        </tr>
                        <tr>
                            <td>Change Percent</td>
                            <td id="changePercent">
                                ${data.dp}%
                                ${arrowHtml}
                            </td>
                        </tr>
                    </table>
                </div>
                `;
        }).catch(error => {
            // addErrorToContainer('Error fetching stock summary: ' + error);
        });
    await fetch('/company-stock-recommendation-trends/' + symbol)
        .then(response => response.json())
        .then(data => {
            const reccData = data[0];
            htmlToAdd += `
                <div class="reccomendation-container" style="width: 600px">
                    <span class="reccomendationBox" style="color: #EB2E3C; width: 55px;">
                        Strong Sell
                    </span>
                    <span class="reccomendationBox" style="background: #EB2837">
                        ${reccData.strongSell}
                    </span>
                    <span class="reccomendationBox" style="background: #AF5F46">
                        ${reccData.sell}
                    </span>
                    <span class="reccomendationBox" style="background: #73915A">
                        ${reccData.hold}
                    </span>
                    <span class="reccomendationBox" style="background: #37C869">
                        ${reccData.buy}
                    </span>
                    <span class="reccomendationBox" style="background: #01FF7D">
                        ${reccData.strongBuy}
                    </span>
                    <span class="reccomendationBox" style="color: #4ACD77; width: 55px;">
                        Strong Buy
                    </span>
                </div>
                `;
        }).catch(error => {
            // addErrorToContainer('Error fetching stock summary: ' + error);
        });

    let stockSummaryDiv = document.getElementById('tab-stock-summary');
    stockSummaryDiv.innerHTML = htmlToAdd;
}

function openChartsTab() {
    hideOtherTabsAndChangeActiveTab('tab-charts');

}

function getChartsData() {
    fetch('/company-chart-data/' + symbol)
        .then(response => response.json())
        .then(data => {
            let chartContainer = document.getElementById('tab-charts');
            chartContainer.innerHTML = `
                <div id="chartContainer"></div>
            `;
            createChart(data["results"],data["ticker"]);
        }).catch(error => {
        addErrorToContainer('Error fetching charts: ' + error);
    });
}

function createChart(data,ticker) {
    console.log(data);
    var d = new Date();
    var year = d.getFullYear().toString();
    var month = d.getMonth().toString();
    var day = d.getDate().toString();

    const ohlc = [], volume = [], dataLength = data?.length, // set the allowed units for data grouping
        groupingUnits = [['week',                         // unit name
            [1]                             // allowed multiples
        ], ['month', [1, 2, 3, 4, 6]]];

    for (let i = 0; i < dataLength; i += 1) {
        ohlc.push([data[i]["t"], // the date
            data[i]["c"],// close
        ]);

        volume.push([data[i]["t"], // the date
            data[i]["v"] // the volume
        ]);
    }
console.log(ohlc);
console.log(volume);
    // create the chart
    Highcharts.stockChart('tab-charts', {
        navigator: {
            series: {
                accessibility: {
                    exposeAsGroupOnly: true
                },
    
            }
        },
        subtitle: {
            useHTML: true,
            text: '<a href="https://polygon.io/" style="color:blue,"><u>Source:  Polygon.io </u> </a>'
        },
        rangeSelector: {
            buttons: [{
                type: 'day',
                count: 7,
                text: '7d',
            }, {
                type: 'day',
                count: 15,
                text: '15d',
            }, {
                type: 'month',
                count: 1,
                text: '1m',
            }, {
                type: 'month',
                count: 3,
                text: '3m',
            }, {
                type: 'month',
                count: 6,
                text: '6m',
            }],
            inputEnabled: false  
        },
    
        title: {
            text: "Stock Price " + ticker + year+"-"+month+"-"+day,
        },
       
        yAxis: [
            {
                labels: {
                    align: 'left',
                    x: 0
                },
                title: {
                    text: 'Volume'
                },
                top: '0%',
                height: '100%',
                offset: 0,
                lineWidth: 2,
                tickAmount:6,
            max: 2*Math.max(...volume.map(([, value]) => value)),
                
            },
            {
                title: {
                    text: "Stock Price", 
                 
                },
                tickAmount:6,
                opposite: false,
            }
        ],
    
        tooltip: {
            split: true
        },
    
        series: [{
            name: 'Stock Price',
            data: ohlc,
            type: 'area',
            yAxis: 1,
            tooltip: {
                valueDecimals: 2
            },
            fillColor: {
                linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1
                },
                stops: [
                    [0, Highcharts.getOptions().colors[0]],
                    [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                ]
            }
        }, {
            type: 'column',
            name: 'Volume',
            data: volume,
            yAxis: 0,
            color: 'black',
            pointWidth: 5,
            pointPlacement:'on',
        }],
    });
    
}

function openNewsTab() {
    hideOtherTabsAndChangeActiveTab('tab-news');
}

function getLatestNewsData() {
    fetch('/company-news/' + symbol)
        .then(response => response.json())
        .then(data => {
            let latestNews = document.getElementById('tab-news');
            latestNews.innerHTML = '';
            data.forEach(function (item) {
                let div = document.createElement('div');
                div.innerHTML = `
                    <div class="news-container">
                        <img src="${item.image}" class="news-image" alt="News Image">
                        <div class="news-data">
                            <h3>${item.headline}</h3>
                            <p>${item.summary}</p>
                            <a href="${item.url}" target="_blank">Read more</a>
                        </div>
                    </div>
                `;
                latestNews.appendChild(div);
            });
        }).catch(error => {
        // addErrorToContainer('Error fetching news: ' + error);
    });

}
