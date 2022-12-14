// console.log("This a log from content.js!")

function getLeaf(element) {
    if (element.hasChildNodes()) {
        leafValue = getLeaf(element.childNodes[0])
        return leafValue;
    }
    else {
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
    var questions = [];
    for (var i = 0; i < nodes.length-1; i += 2) {

        var question = getLeaf(nodes.item(i).querySelector(".rc-FormPartsQuestion__contentCell"));
        var options = getOptions(nodes.item(i+1).querySelector(".rc-FormPartsQuestion__contentCell"));
        questions.push({
            "question": question,
            "options": options
        });
    }
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
    quizObj["questions"] = questions;
    return quizObj;


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


function setQuestionOverlay(quiz_data) {
    console.log("Quiz data in overlay call: ", quiz_data);

    // document.getElementById('TUNNELVISIONWRAPPER_CONTENT_ID').insertAdjacentHTML('afterend', html_to_insert);
    // var questionOverlay = document.getElementsByClassName("card-body text-dark");
    // console.log("questionOverlay: ", questionOverlay);
    var questions = quiz_data["questions"];
    var questionsHTML = "";
    questions.forEach(function(item) {
        var optionsHTML = "";
        var options = item["options"];
        options.forEach(function(option){
            optionsHTML += `<li class="card-text">${option}</li>`;
        })
        html = `
        <div class="card border-dark mb-3">
            <div class="card-header">${item["question"]}</div>
            <div class="card-body text-dark">
                <h5 class="card-title">
                    <ul>
                        ${optionsHTML}
                    </ul>         
                </h5>
            </div>
        </div>
        `
        questionsHTML += html;
    })
    console.log(questionsHTML);
    html_to_insert = `
    <div id="cp-questions" class="container-fluid">
        <div class="flex-row-reverse">
            <div class="card-body text-dark">
            ${questionsHTML}
            </div>
        </div>
    </div>
    `;
    document.getElementById('TUNNELVISIONWRAPPER_CONTENT_ID').insertAdjacentHTML('afterend', html_to_insert);
    // questionOverlay.innerHTML = questionsHTML;
    

}

 (() => {

    // chrome.storage.local.clear(function() {
    //     console.log("Clearing local data")
    // });

    chrome.runtime.onMessage.addListener(async (obj, sender, response) => {
        const { tabId, type, courseName, id, quizName, attempt } = obj;
        console.log("tab id", tabId)
        // chrome.storage.local.get(null, function(items) {
        //     var allKeys = Object.keys(items);
        //     console.log("all: ", allKeys);
        //  });

        // Load data from the local store:
        var loaded_data = [];
        chrome.storage.local.get('quiz_data').then((result) => {
            if (Object.keys(result).length === 0){
                console.log("Empty data");
            }
            else {
                loaded_data = result["quiz_data"];
                console.log("loaded_data: ", loaded_data);
            }
        })

        if (document.readyState === "loading") {
            document.addEventListener('DOMContentLoaded', afterDOMLoaded);
        } else {
            // Load the questions:
            quiz_return = await afterDOMLoaded(obj);
            if(loaded_data.some(e => e.id === obj.id)){
                console.log("Already in array")
            }
            else {
                loaded_data.push(quiz_return);
            }
            console.log("QuizReturn: ", quiz_return)
            chrome.storage.local.set({ 'quiz_data': loaded_data }).then(() => {
                console.log("");
            });

            // Execute the overlay script:
            setQuestionOverlay(quiz_return);
        }
        
        var submit_button = document.querySelector('[data-test="submit-button"]');
        console.log("Submit: ", submit_button);
        submit_button.addEventListener("click", function(){
            console.log("Submit button clicked!")
        })


    });
})();

