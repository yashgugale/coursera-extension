// console.log("This a log from content.js!")

function getLeaf(element) {
    // console.log("In leaf: ", element);
    if (element.hasChildNodes()) {
        leafValue = getLeaf(element.childNodes[0])
        return leafValue;
    }
    else {
        // console.log("Leaf element: ", element);
        // console.log("Leaf: ", element.nodeValue);
        return element.nodeValue.trim();
    }
}

function getOptions(element) {
    var questions = [];
    var node = element.childNodes[0];

    var children = node.childNodes;
    children.forEach(function(node){
        questions.push(getLeaf(node.querySelector(".rc-Option__input-text")));
    });

    return questions;
}

function saveAllQuestions() {
    const nodes = document.getElementsByClassName("rc-FormPartsQuestion__row");
    // console.log("Nodes: ", nodes)
    // console.log("typeof(Nodes): ", typeof(nodes));
    // console.log("Length: ", nodes.length);
    for (var i = 0; i < nodes.length-1; i += 2) {

        var question = getLeaf(nodes.item(i).querySelector(".rc-FormPartsQuestion__contentCell"));
        console.log(`Question ${(i+2)/2}: `, question);
        var options = getOptions(nodes.item(i+1).querySelector(".rc-FormPartsQuestion__contentCell"));
        console.log("Options: ", options.toString());
        // break;
    }
}

function afterDOMLoaded() {
    setTimeout(saveAllQuestions, 10000);
}

(() => {

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, courseName, id, quizName, attempt } = obj;
        
        // console.log("type: ", type);
        // console.log("courseName: ", courseName);
        // console.log("id: ", id);
        // console.log("quizName: ", quizName);
        // console.log("attempt: ", attempt);

        if (document.readyState === "loading") {
            document.addEventListener('DOMContentLoaded', afterDOMLoaded);
        } else {
            afterDOMLoaded();
        }
        
    });
})();

