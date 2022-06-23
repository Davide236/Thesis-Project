require('dotenv').config();

const Survey = require('./models/Survey');
const DBController = require('./configuration/db-config');

async function main() {
    //await connectToDB();
    await DBController.setupDatabase();
    let q = require('./public/survey/survey_questions.json');
    let questions_list = q.questions;
    let answers = await Survey.find({});  
    let table = [];
    let idx = 0;
    for (question of questions_list) {
        let yes = 0;
        let no = 0;
        let justifications = [];
        for (a of answers) {
            let answer = a.answers;
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
    let ux = ['Easy to navigate', 'Easy to understand'];
    for (let i=0; i<2; i++) {
        average_val = 0;
        total = answers.length;
        for (a of answers) {
            let answer = a.answers;
            average_val += Number(answer[idx].answer);
        }
        idx++;
        table.push({'question': ux[i], 'yes': average_val/total, 'no': 0, 'answers': []});
    }
    console.log('Question | Yes | No | Justifications');
    for (entry of table) {
        console.log(entry.question, '|', entry.yes,'|', entry.no,'|', entry.answers);
        console.log('------------------------------------')
    }
}

main();
