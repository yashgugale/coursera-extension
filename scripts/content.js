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
    console.log("Nodes: ", nodes)
    console.log("Length: ", nodes.length)
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
}


function setQuestionOverlay(quiz_data) {
    console.log(quiz_data);
    // document.getElementById('TUNNELVISIONWRAPPER_CONTENT_ID').insertAdjacentHTML('afterend', html_to_insert);
    // var questionOverlay = document.getElementsByClassName("card-body text-dark");
    // console.log("questionOverlay: ", questionOverlay);
    var questions = quiz_data["quiz_result"];
    var questionsHTML = "";
    questions.forEach(function(item) {
        var optionsHTML = "";
        if(item["correct_solution"]) {
            item["correct_solution"].forEach(function(selectedOption){
                optionsHTML += `<div class="card-text text-success">${selectedOption}</div>`;
            })
        }
        else if(item["wrong_solution"]) {
            item["wrong_solution"].forEach(function(wrongOption){
                optionsHTML += `<div class="card-text text-danger"><del>${wrongOption}<del></div>`;
            })
        }
        else {
            return;
        }
        
        html = `
        <div class="card border-dark mb-3">
            <div class="card-header">${item["question"]}</div>
            <div class="card-body text-dark">
                <h5 class="card-title">
                    <div>
                        ${optionsHTML}
                    </div>         
                </h5>
            </div>
        </div>
        `
        questionsHTML += html;
    })
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

// function checkUserSolution(optionsNode) {
//     var node = optionsNode.childNodes[0];
//     var selected_options = [];
//     var children = node.childNodes;
//     children.forEach(function(node){
//         if (node.querySelector(".cui-isChecked")) {
//             option = getLeaf(node.querySelector(".rc-Option__input-text"))
//             selected_options.push({
//                 "value": option,
//                 "selected": true
//             })
//         }
//         else {
//             option = getLeaf(node.querySelector(".rc-Option__input-text"))
//             selected_options.push({
//                 "value": option,
//                 "selected": false
//             })
//         }
//     });

//     return selected_options;
// }

function checkUserSolution(optionsNode) {
    var node = optionsNode.childNodes[0];
    var selected_options = [];
    var children = node.childNodes;
    children.forEach(function(node){
        if (node.querySelector(".cui-isChecked")) {
            option = getLeaf(node.querySelector(".rc-Option__input-text"))
            selected_options.push(option)
        }
    });

    return selected_options;
}

function getResponses() {
    console.log("In user responses!")
    const nodes = document.getElementsByClassName("rc-FormPartsQuestion__row");
    var responses = [];
    for (var i = 0; i < nodes.length-1; i += 2) {
        var questionNode = nodes.item(i).querySelector(".rc-FormPartsQuestion__contentCell")
        var optionsNode = nodes.item(i+1).querySelector(".rc-FormPartsQuestion__contentCell")
        var question = getLeaf(questionNode);
        var answered = checkUserSolution(optionsNode);

        responses.push({
            "question": question,
            "selected": answered
        });

    }
    return responses;
}

function checkSuccess(optionsNode) {

    if (optionsNode.querySelector('[data-testid="GradeFeedback-success"]')) {
        // var feedback_node = optionsNode.querySelector('[data-testid="GradeFeedback-info"]')
        // var feedback_data = 
        // console.log(feedback_node)
        // var feedback = getLeaf(feedback_node.children[1]);
        // console.log("Feedback: ", feedback)

        return true;
    }
    return false;
}

function checkSolution(result_data) {

    const nodes = document.getElementsByClassName("rc-FormPartsQuestion__row");
    for (var i = 0; i < nodes.length-1; i += 2) {
        var questionNode = nodes.item(i).querySelector(".rc-FormPartsQuestion__contentCell")
        var optionsNode = nodes.item(i+1).querySelector(".rc-FormPartsQuestion__contentCell")
        var question = getLeaf(questionNode);
        result_data.forEach(function(data, index) {
            var res_question = data["question"];
            var res_selected = data["selected"];
            if (res_selected.length > 0) {
                if (res_question === question) {
                    var success = checkSuccess(optionsNode);
                    if (success) {
                        result_data[index]["correct"] = true
                        result_data[index]["correct_solution"] = res_selected;
                    }
                    else {
                        result_data[index]["correct"] = false
                        result_data[index]["wrong_solution"] = res_selected;
                    }
                }
            }
            
        })
    }
    console.log("result data on checking solution: ", result_data);
    return result_data;
}

function addTriggerOnsubmit(obj, loaded_data) {
    var submit_button = document.querySelector('[data-test="submit-button"]');
    submit_button.addEventListener("click", function(){
        var marked_responses = getResponses();
        console.log("User selection: ", marked_responses);

        setTimeout(function() {
            var result_data = checkSolution(marked_responses);
            obj["quiz_result"] = result_data;
            loaded_data.push(obj);

            // Save the data:
            chrome.storage.local.set({ 'quiz_data': loaded_data }).then(() => {
                console.log("Saving data!");
            });
        }, 2000);
    })
}


async function runOnLoad(obj) {

    const { tabId, type, courseName, id, quizName, attempt } = obj;
    delete obj["tabId"]

    // Load the quiz data from memory and show on the screen:
    var loaded_data = [];
    chrome.storage.local.get('quiz_data').then((result) => {
        if (Object.keys(result).length === 0){
            console.log("Empty data");
        }
        else {
            loaded_data = result["quiz_data"];
            console.log("Loaded: ", loaded_data);
            loaded_data.forEach(function(quiz) {
                if (quiz.id === obj.id) {
                    setQuestionOverlay(quiz);
                }
            })
        }
    });


    // Add trigger on the submit button:
    // var result_data = await addTriggerOnsubmit();
    // quiz_info = obj["quiz_result"] = result_data;
    // loaded_data.push(quiz_info);

    // // Save the data:
    // chrome.storage.local.set({ 'quiz_data': loaded_data }).then(() => {
    //     console.log("Saving data!");
    // });

    var result_data = await addTriggerOnsubmit(obj, loaded_data);


}

 (() => {

    chrome.storage.local.clear(function() {
        console.log("Clearing local data")
    });


    test_data = [
        {
            "attempt": "attempt",
            "courseName": "3d-printing-revolution",
            "id": "srTX9",
            "quizName": "module-1-practice-quiz",
            "type": "quiz",
            "quiz_result": [
                {
                    "question": "What happened a few years ago\nthat helped a number of new firms enter the 3D printing industry?",
                    "correct_solution": ["The patents for several types of 3D printing technologies started to expire."]
                },
                {
                    "question": "Which adjective describes what 3D printing’s manufacturing process is like?",
                    "correct_solution": ["additive"]
                },
                {
                    "question": "Considering the current\ncosts of 3D printers, which of the following\n3D printing technologies is most expensive?",
                    "wrong_solution": ["FDM"]
                },
                {
                    "question": "At which website can you download design files for free?",
                    "wrong_solution": ["Fusion", "Thingiverse"]
                },
                {
                    "question": "Considering the current\ncosts of 3D printers, which of the following\n3D printing technologies is most expensive?",
                    "wrong_solution": []
                }
            ]
        }
    ]

    // Save the tet data:
    chrome.storage.local.set({ 'quiz_data': test_data }).then(() => {
        console.log("Saving test data!");
    });

    chrome.runtime.onMessage.addListener(async (obj, sender, response) => {

        setTimeout(function() {
            runOnLoad(obj)
        }, 10000);

        // chrome.storage.local.get(null, function(items) {
        //     var allKeys = Object.keys(items);
        //     console.log("all: ", allKeys);
        //  });





        // if (document.readyState === "loading") {
        //     document.addEventListener('DOMContentLoaded', addTriggerOnsubmit);
        // } else {
        //     await addTriggerOnsubmit();
        //     console.log("DOM is still being loaded!")
        // }        

        // var submit_button = document.querySelector('[data-test="submit-button"]');
        // console.log("Submit: ", submit_button);
        // submit_button.addEventListener("click", function(){
        //     console.log("Submit button clicked!")
        //     console.log("TODO: Load the options the user had selected for each question and save it")
        //     console.log("TODO: After submit finishes, check for correct answers")
        // })

        // if (document.readyState === "loading") {
        //     document.addEventListener('DOMContentLoaded', afterDOMLoaded);
        // } else {
        //     // Load the questions:
        //     quiz_return = await afterDOMLoaded(obj);
        //     if(loaded_data.some(e => e.id === obj.id)){
        //         console.log("Already in array")
        //     }
        //     else {
        //         loaded_data.push(quiz_return);
        //     }
        //     console.log("QuizReturn: ", quiz_return)
        //     chrome.storage.local.set({ 'quiz_data': loaded_data }).then(() => {
        //         console.log("");
        //     });

        //     // // Execute the overlay script:
        //     // setQuestionOverlay(quiz_return);
        // }
        



    });
})();

