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
        else if(item["wrong_solution"] !== undefined && item["wrong_solution"].length > 0) {
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
        return true;
    }
    return false;
}

function checkSolution(result_data) {

    var correct_options = []
    var wrong_options = []

    // TODO: Clean this up:
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
                        // correct_options.push(res_selected);
                        correct_options = correct_options.concat(res_selected);
                    }
                    else {
                        // wrong_options.push(res_selected);
                        wrong_options = wrong_options.concat(res_selected);
                    }
                }
            }
            
        })
    }

    return [correct_options, wrong_options];
}


function updateSolution(obj, loaded_data, marked_responses){
    
    // const { type, courseName, id, quizName, attempt } = obj;

    var [correct_options, wrong_options] = checkSolution(marked_responses);
    console.log("Correct: ", correct_options)
    console.log("Wrong: ", wrong_options)
    
    console.log("loaded data (a): ", loaded_data);
    console.log("obj (a): ", obj);

    var previous_correct = [];
    var previous_wrong = [];
    var quiz_index = 0;

    if(loaded_data) {
        loaded_data.forEach(function(quiz, index) {
            console.log("In loaded data")
            if (quiz.id === obj.id) {
                previous_correct = quiz["correct_answers"]
                previous_wrong = quiz["wrong_answers"]
                quiz_index = index
            }
        });
    }

    correct_options.forEach(function(value) {
        if(!previous_correct.includes(value)) {
            console.log("new correct add: ", value);
            previous_correct.push(value);
        }
    })

    wrong_options.forEach(function(value) {
        if(!previous_wrong.includes(value)) {
            console.log("new wrong add: ", value);
            previous_wrong.push(value);
        }
    })
    console.log("Previous wrong: ", previous_wrong);
    console.log("Previous correct: ", previous_correct);
    obj["correct_answers"] = previous_correct;
    obj["wrong_answers"] = previous_wrong;
    loaded_data[quiz_index] = obj;

    // loaded_data[quiz_index]["correct_answers"] = previous_correct;
    // loaded_data[quiz_index]["wrong_answers"] = previous_wrong;

    console.log("New data: ", loaded_data);

    // Save the data:
    chrome.storage.local.set({ 'quiz_data': loaded_data }).then(() => {
        console.log("Saving data!");
    });


    // loaded_data.forEach(function(quiz, quiz_index) {
    //     console.log("In loaded data")
    //     if (quiz.id === obj.id) {
    //         console.log("id matches")
    //         var previous_correct = quiz["correct_answers"]
    //         var previous_wrong = quiz["wrong_answers"]
    //         console.log("Previous wrong (before): ", previous_wrong);
    //         console.log("Previous correct (before): ", previous_correct);
    //         correct_options.forEach(function(value) {
    //             if(!previous_correct.includes(value)) {
    //                 console.log("new correct add: ", value);
    //                 previous_correct.push(value);
    //             }
    //         })

    //         wrong_options.forEach(function(value) {
    //             if(!previous_wrong.includes(value)) {
    //                 console.log("new wrong add: ", value);
    //                 previous_wrong.push(value);
    //             }
    //         })
    //         console.log("Previous wrong: ", previous_wrong);
    //         console.log("Previous correct: ", previous_correct);
    //         loaded_data[quiz_index]["correct_answers"] = previous_correct;
    //         loaded_data[quiz_index]["wrong_answers"] = previous_wrong;


//             // result_data.forEach(function(result) {
//             //     var res_ques = result["question"]
//             //     var quiz_ques = quiz["question"]
//             //     if (res_ques === quiz_ques) {
//             //         if (quiz["correct_solution"] !== undefined && quiz["correct_solution"].length > 0) {

//             //         }
//             //         else if(result["wrong_solution"] !== undefined && result["wrong_solution"].length > 0) {
//             //             result["wrong_solution"].forEach(function(value) {
//             //                 if (!quiz["wrong_solution"].includes(value)) {
//             //                     quiz["wrong_solution"].push(value);
//             //                   }                                      
//             //             })
//             //             result_data[quiz_index] = quiz;
//             //         }
//             //     }
//             // })

            // loaded_data.push(obj);
            // console.log("New data: ", loaded_data);

            // // Save the data:
            // chrome.storage.local.set({ 'quiz_data': loaded_data }).then(() => {
            //     console.log("Saving data!");
            // });

    //     }
    // })
}

function addTriggerOnsubmit(obj, loaded_data) {

    console.log("loaded data (b): ", loaded_data);
    console.log("obj (b): ", obj);
    var submit_button = document.querySelector('[data-test="submit-button"]');
    if(submit_button){
        submit_button.addEventListener("click", function(){
            var marked_responses = getResponses();
            console.log("User selection: ", marked_responses);

            // TODO: Fix everything in here:
            setTimeout(function() {
                updateSolution(obj, loaded_data, marked_responses);
            }, 2000);
        })

    }

}

function getLeafNode(element) {
    if (element.hasChildNodes()) {
        var [element, leafValue] = getLeafNode(element.childNodes[0])
        return [element, leafValue];
    }
    else {
        return [element.parentNode, element.nodeValue.trim()];
    }
}

function getNodeText(element) {
    var options = [];
    var textNodes = [];
    var node = element.childNodes[0];

    var children = node.childNodes;
    children.forEach(function(node){
        var [textNode, text] = getLeafNode(node.querySelector(".rc-Option__input-text"));
        options.push(text);
        textNodes.push(textNode)
    });
    return [options, textNodes];
}

function setSuccessText(node) {
    node.classList.add("text-success")
}

function setFailureText(node) {
    node.classList.add("text-danger")
}


function setTextBackground(quiz_data) {

    // TODO: Put in try catch block if value returned is empty:
    var correct_solution = quiz_data["correct_answers"];
    var wrong_solution = quiz_data["wrong_answers"];
    const nodes = document.getElementsByClassName("rc-FormPartsQuestion__row");

    for (let i = 0; i < nodes.length-1; i += 2) {
        // var question = getLeaf(nodes.item(i).querySelector(".rc-FormPartsQuestion__contentCell"));
        var [options, textNodes] = getNodeText(nodes.item(i+1).querySelector(".rc-FormPartsQuestion__contentCell"));
        for (let j = 0; j < options.length; j++) {
            if (correct_solution.includes(options[j])){
                setSuccessText(textNodes[j]);
            }
            else if(wrong_solution.includes(options[j])) {
                setFailureText(textNodes[j]);
            }
        }
    }
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
            console.log("Loaded data read: ", loaded_data);
            // console.log("Loaded: ", loaded_data);
            loaded_data.forEach(function(quiz) {
                if (quiz.id === obj.id) {
                    // setQuestionOverlay(quiz);
                    setTextBackground(quiz);
                }
            })
        }
        console.log("Loaded data to trigger: ", loaded_data);
        // var result_data = await addTriggerOnsubmit(obj, loaded_data);
        addTriggerOnsubmit(obj, loaded_data);
        
    });


    // Add trigger on the submit button:
    // var result_data = await addTriggerOnsubmit();
    // quiz_info = obj["quiz_result"] = result_data;
    // loaded_data.push(quiz_info);

    // // Save the data:
    // chrome.storage.local.set({ 'quiz_data': loaded_data }).then(() => {
    //     console.log("Saving data!");
    // });
    // console.log("Loaded data to trigger: ", loaded_data);
    // var result_data = await addTriggerOnsubmit(obj, loaded_data);


}

 (() => {

    // chrome.storage.local.clear(function() {
    //     console.log("Clearing local data")
    // });


    // test_data = [
    //     {
    //         "attempt": "attempt",
    //         "courseName": "3d-printing-revolution",
    //         "id": "srTX9",
    //         "quizName": "module-1-practice-quiz",
    //         "type": "quiz",
    //         "correct_answers": [
    //             "The patents for several types of 3D printing technologies started to expire.",
    //             "additive"
    //         ],
    //         "wrong_answers": [
    //             "FDM",
    //             "Fusion"
    //         ],
    //         "quiz_result": [
    //             {
    //                 "question": "What happened a few years ago\nthat helped a number of new firms enter the 3D printing industry?",
    //                 "correct_solution": ["The patents for several types of 3D printing technologies started to expire."]
    //             },
    //             {
    //                 "question": "Which adjective describes what 3D printing’s manufacturing process is like?",
    //                 "correct_solution": ["additive"]
    //             },
    //             {
    //                 "question": "Considering the current\ncosts of 3D printers, which of the following\n3D printing technologies is most expensive?",
    //                 "wrong_solution": ["FDM"]
    //             },
    //             {
    //                 "question": "At which website can you download design files for free?",
    //                 "wrong_solution": ["Fusion", "Thingiverse"]
    //             },
    //             {
    //                 "question": "Considering the current\ncosts of 3D printers, which of the following\n3D printing technologies is most expensive?",
    //                 "wrong_solution": []
    //             }
    //         ]
    //     }
    // ]

    // // Save the tet data:
    // chrome.storage.local.set({ 'quiz_data': test_data }).then(() => {
    //     console.log("Saving test data!");
    // });

    chrome.runtime.onMessage.addListener(async (obj, sender, response) => {

        let runOnce = false;

        if(!runOnce){
            setTimeout(function() {
                runOnLoad(obj)
            }, 10000);
            runOnce = true;
        }
        

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

