console.log("This a log from background.js!")
// NOTE:
// Service workers do not have direct access to DOM. That data will need to be accessed in the conten script.


// const tabs = chrome.tabs.query({
//     url: [
//         "https://www.coursera.org/learn/*/quiz/*"
//     ],
// });

// if (tabs) {
//     console.log("tabs: ", tabs);
// }

// chrome.tabs.onUpdated.addListener((tabId, tab) => {

//     console.log("tab: ", tab);
//     console.log("tab.url: ", tab.url);
//     console.log("tabId: ", tabId);

//     // if (tab.url && tab.url.includes("www.coursera.org/learn/*/quiz/*")){
//     if (tab.url && tab.url.includes("quiz")){
//         const queryParameters = tab.url.split("/");
//         console.log("queryParameters: ", queryParameters)
        
//     }
// });

// TODO: Need to fix onActivated and instead use onUpdated since we want to run it the first time the webpage is loaded:
// chrome.tabs.onActivated.addListener((activeInfo) => {

//     chrome.tabs.get(activeInfo.tabId, function(tab){

//     // if (tab.url && tab.url.includes("www.coursera.org/learn/*/quiz/*")){
//     if (tab.url && tab.url.includes("quiz")){
//         // console.log("tab: ", tab);
//         // console.log("tabId: ", activeInfo.tabId);
//         // console.log("tab.url: ", tab.url);
        
//         const courseName = tab.url.match('learn\/(.*?)\/')[1]
//         const idMatch = tab.url.match('(exam|quiz)\/(.*?)\/')
//         const type = idMatch[1]
//         const id = idMatch[2]
//         const quizName = tab.url.match(id + '\/(.*?)\/')[1]
//         const attempt = tab.url.match('([^\/]+$)')[0]
//         // console.log("type: ", type);
//         // console.log("courseName: ", courseName);
//         // console.log("id: ", id);
//         // console.log("quizName: ", quizName);
        
//         chrome.tabs.sendMessage(activeInfo.tabId, {
//             type: type,
//             courseName: courseName,
//             id: id,
//             quizName: quizName,
//             attempt: tab.url.includes('attempt') ? attempt : 'false'
//         });

//     }
// });

// });

// function nodeInsertedCallback(event){
//     console.log(event);
// }

// chrome.tabs.onUpdated.addListener('DOMNodeInserted', nodeInsertedCallback);


function viewDomData(DOMContent) {
    console.log("DOM data: ", DOMContent);
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    // console.log("*******")
    // console.log("tab: ", tab)
    // console.log("tabId: ", tabId);
    // console.log("tab.url: ", tab.url);
    // console.log("changeInfo: ", changeInfo)

    // console.log("##########")
    // if( changeInfo.status === "complete"){
    //     if (tab.url && tab.url.includes("quiz")){
    //         console.log("tab: ", tab);
    //         console.log("tabId: ", tabId);
    //         console.log("tab.url: ", tab.url);
    //     }
    // }

    if (changeInfo.status === "complete") {

        if (tab.url && tab.url.includes("quiz")){
            // console.log("tab: ", tab);
            // console.log("tabId: ", tabId);
            // console.log("tab.url: ", tab.url);
            
            const courseName = tab.url.match('learn\/(.*?)\/')[1]
            const idMatch = tab.url.match('(exam|quiz)\/(.*?)\/')
            const type = idMatch[1]
            const id = idMatch[2]
            const quizName = tab.url.match(id + '\/(.*?)\/')[1]
            const attempt = tab.url.match('([^\/]+$)')[0]
            // console.log("type: ", type);
            // console.log("courseName: ", courseName);
            // console.log("id: ", id);
            // console.log("quizName: ", quizName);
            
            chrome.tabs.sendMessage(tabId, {
                type: type,
                courseName: courseName,
                id: id,
                quizName: quizName,
                attempt: tab.url.includes('attempt') ? attempt : 'false' // TODO: Fix the attempt to pass quiz attempted vs just viewing the quiz
            }, viewDomData);

     

        }

    }


});