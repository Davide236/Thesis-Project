require('dotenv').config();

const Survey = require('./models/Survey');
const DBController = require('./configuration/db-config');

// This function retrieves the result of the survey and presents them in a simple
// table like format
async function main() {
    await DBController.setupDatabase();
    let q = require('./public/survey/survey_questions.json');
    let questions_list = q.questions;
    let answers = await Survey.find({});  
    let table = [];
    let idx = 0;
    // In this loop we build the table of results
    for (question of questions_list) {
        let yes = 0;
        let no = 0;
        let justifications = [];
        for (a of answers) {
            let answer = a.answers;
            // Count the number of positive and negavite answers
            if (answer[idx].answer == 'yes') {
                yes++;
            } else {
                no++;
                if (answer[idx].explanation) {
                    justifications.push(answer[idx].explanation);
                }
            }
        }
        table.push({'question': question.title, 'yes': yes, 'no': no, 'answers': justifications});
        idx ++;
    }
    // Check the answers to the questions regarding the user experience
    let ux = ['Easy to navigate', 'Easy to understand'];
    for (let i=0; i<2; i++) {
        average_val = 0;
        total = answers.length;
        // Calculate the average of those answers
        for (a of answers) {
            let answer = a.answers;
            average_val += Number(answer[idx].answer);
        }
        idx++;
        table.push({'question': ux[i], 'yes': average_val/total, 'no': 0, 'answers': []});
    }
    // Print the results on console
    console.log('Question | Yes | No | Justifications');
    for (entry of table) {
        console.log(entry.question, '|', entry.yes,'|', entry.no,'|', entry.answers);
        console.log('------------------------------------')
    }
}

main();
