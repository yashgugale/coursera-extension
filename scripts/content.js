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
    var questions = [];
    for (var i = 0; i < nodes.length-1; i += 2) {

        var question = getLeaf(nodes.item(i).querySelector(".rc-FormPartsQuestion__contentCell"));
        // console.log(`Question ${(i+2)/2}: `, question);
        var options = getOptions(nodes.item(i+1).querySelector(".rc-FormPartsQuestion__contentCell"));
        // console.log("Options: ", options.toString());
        questions.push({
            "question": question,
            "options": options
        });
    }
    // console.log("2: Questions: ", questions)
    return questions;
}

function getQuizDataAsync() {
    return new Promise((resolve, reject) =>{
        // questions = setTimeout(saveAllQuestions =>{
        setTimeout(() =>{
            questions = saveAllQuestions();
            resolve(questions);
        }, 10000);
    });
}



async function afterDOMLoaded(quizObj) {

    questions = await getQuizDataAsync()
    .then(function (questions) {
        return questions;
    })
    .catch(function() {
        console.log("Failure to fulfil promise!");
    })
    // console.log("questions: ", questions)
    quizObj["questions"] = questions;
    console.log("1: ", quizObj);
    quizData = {
        "id": quizObj["id"],
        "quiz": quizObj
    }
    chrome.storage.local.set({ 'quiz_data': quizData }).then(() => {
        console.log("Quiz value stored locally!: " + quizData);
        console.log("typeof!: " + typeof(quizData));
    })

    // return quizObj;

    // setTimeout(saveAllQuestions(), 10000)
    //     .then(questions => quizObj["questions"] = questions)
    //     .then(quizData => {
    //         console.log("1: ", quizData);
    //     })
    //     .catch(function() {
    //         console.log("Failure to fulfil promise!");
    //     })
}

// TODO: Function to load data:
// TODO: Function to write data:

(() => {

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, courseName, id, quizName, attempt } = obj;
        
        // console.log("type: ", type);
        // console.log("courseName: ", courseName);
        // console.log("id: ", id);
        // console.log("quizName: ", quizName);
        // console.log("attempt: ", attempt);

        chrome.storage.local.get(null, function(items) {
            var allKeys = Object.keys(items);
            console.log("all: ", allKeys);
         });

        quizData = {};
        chrome.storage.local.get('quiz_data').then((result) => {
            if (Object.keys(result).length === 0){
                console.log("Empty data")
            }
            else {
                quizData = result.key;
                console.log("result: ", result);
                console.log("Data loaded locally: ", result.key);
            }

        })

        if (document.readyState === "loading") {
            document.addEventListener('DOMContentLoaded', afterDOMLoaded);
        } else {
            afterDOMLoaded(obj);

        }
        
    });
})();

